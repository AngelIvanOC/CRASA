import { supabase } from "../index";

export const uploadPdfToSupabase = async (pdfFile) => {
  if (!pdfFile) return null;

  const filePath = `facturas/${Date.now()}_${pdfFile.name}`;
  const { error } = await supabase.storage
    .from("facturas")
    .upload(filePath, pdfFile);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("facturas")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

export const insertVentaWithProducts = async (
  ventaData,
  extractedData,
  insertarVenta
) => {
  // 1. Subir PDF si existe
  const pdfUrl = await uploadPdfToSupabase(ventaData.pdfFile);

  // 2. Insertar venta principal
  const ventaInsertData = {
    codigo: ventaData.codigo,
    marca_id: ventaData.marca_id || null,
    cantidad_productos: ventaData.cantidad_productos || 0,
    cantidad_total: ventaData.cantidad_total || 0,
    fecha: ventaData.fecha || null,
    factura_url: pdfUrl,
  };

  const idVentaNueva = await insertarVenta(ventaInsertData);
  if (!idVentaNueva) {
    throw new Error("No se pudo insertar la venta principal");
  }

  // 3. Insertar productos si existen
  if (extractedData?.productos?.length > 0) {
    await insertProductsFromExtractedData(
      extractedData.productos,
      idVentaNueva
    );
  }

  return idVentaNueva;
};

const insertProductsFromExtractedData = async (productos, ventaId) => {
  const mapaMarcas = {
    CRASA: 1,
    JUMEX: 2,
    "LA COSTEÑA": 3,
    "CON ALIMENTOS": 4,
  };

  for (const producto of productos) {
    try {
      // Buscar producto existente
      const { data: productoExistente } = await supabase
        .from("productos")
        .select("id")
        .eq("codigo", producto.codigo)
        .maybeSingle();

      let productoId = productoExistente?.id;
      const marcaId = mapaMarcas[producto.marca?.toUpperCase()] ?? null;

      if (marcaId === null) {
        console.error("Marca desconocida:", producto.marca);
        continue;
      }

      // Crear producto si no existe
      if (!productoId) {
        const { data: nuevoProducto, error: errorProducto } = await supabase
          .from("productos")
          .insert({
            codigo: producto.codigo,
            nombre: producto.descripcion || `Producto ${producto.codigo}`,
            marca_id: marcaId,
          })
          .select("id")
          .single();

        if (errorProducto) {
          console.error("Error creando producto:", errorProducto);
          continue;
        }

        productoId = nuevoProducto.id;
      }

      // Insertar detalle de venta
      const { error: errorDetalle } = await supabase
        .from("detalle_ventas")
        .insert({
          venta_id: ventaId,
          producto_id: productoId,
          cantidad: producto.cantidad || 0,
          fecha_caducidad: null,
          ubicacion: null,
        });

      if (errorDetalle) {
        console.error("Error insertando detalle:", errorDetalle);
      }
    } catch (error) {
      console.error("Error procesando producto:", producto.codigo, error);
    }
  }
};
