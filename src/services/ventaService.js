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
  const pdfUrl = await uploadPdfToSupabase(ventaData.pdfFile);

  const ventaInsertData = {
    codigo: ventaData.codigo,
    marca_id: ventaData.marca_id || null,
    fecha: ventaData.fecha || null,
    factura_url: pdfUrl,
  };

  const idVentaNueva = await insertarVenta(ventaInsertData);
  if (!idVentaNueva) {
    throw new Error("No se pudo insertar la venta principal");
  }

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
      const codigoNumerico = parseInt(producto.codigo);

      if (!codigoNumerico || isNaN(codigoNumerico)) {
        console.error("❌ Código inválido:", producto.codigo);
        continue;
      }

      const marcaId = mapaMarcas[producto.marca?.toUpperCase()] ?? null;

      if (marcaId === null) {
        console.error("❌ Marca desconocida:", producto.marca);
        continue;
      }

      const { data: productoExistente, error: errorBusqueda } = await supabase
        .from("productos")
        .select("id, codigo, nombre, marca_id")
        .eq("codigo", codigoNumerico)
        .eq("marca_id", marcaId)
        .maybeSingle();

      let productoId = productoExistente?.id;

      if (!productoId) {
        console.warn(
          `Producto con código ${producto.codigo} no existe - omitiendo`
        );
        continue;
      }

      const { error: errorDetalle } = await supabase
        .from("detalle_ventas")
        .insert({
          venta_id: ventaId,
          producto_id: productoId,
          cantidad: producto.cantidad || 0,
          fecha_caducidad: null,
          ubicacion: null,
        })
        .select("*")
        .single();

      if (errorDetalle) {
        console.error("Error insertando detalle:", errorDetalle);
      }
    } catch (error) {
      console.error("Error procesando producto:", producto.codigo, error);
    }
  }
};

export const insertVentaWithExcelProducts = async (
  ventaData,
  extractedData,
  insertarVenta,
  excelFile
) => {
  const excelUrl = await uploadExcelToSupabase(excelFile);

  const ventaInsertData = {
    codigo: ventaData.codigo || extractedData.pedidoNo,
    marca_id: ventaData.marca_id || null,
    fecha: ventaData.fecha || extractedData.fecha,
    factura_url: excelUrl,
  };

  const idVentaNueva = await insertarVenta(ventaInsertData);

  if (!idVentaNueva) {
    throw new Error("No se pudo insertar la venta principal");
  }

  if (extractedData?.productos?.length > 0) {
    await insertProductsFromExcelData(extractedData.productos, idVentaNueva);
  }

  return idVentaNueva;
};

const insertProductsFromExcelData = async (productos, ventaId) => {
  const mapaMarcas = {
    CRASA: 1,
    JUMEX: 2,
    "LA COSTEÑA": 3,
    "CON ALIMENTOS": 4,
  };

  console.log("🔍 Iniciando inserción de productos desde Excel");
  console.log("📦 Total de productos a procesar:", productos.length);

  for (const producto of productos) {
    try {
      const codigoNumerico = parseInt(producto.codigo);

      console.log("🔍 Procesando producto:");
      console.log(
        "  - Código original:",
        producto.codigo,
        typeof producto.codigo
      );
      console.log(
        "  - Código numérico:",
        codigoNumerico,
        typeof codigoNumerico
      );
      console.log("  - Cantidad:", producto.cantidad);
      console.log("  - Marca:", producto.marca);

      if (!codigoNumerico || isNaN(codigoNumerico)) {
        console.error("❌ Código inválido:", producto.codigo);
        continue;
      }

      const marcaId = mapaMarcas[producto.marca?.toUpperCase()] ?? null;

      if (marcaId === null) {
        console.error("❌ Marca desconocida:", producto.marca);
        continue;
      }

      const { data: productoExistente, error: errorBusqueda } = await supabase
        .from("productos")
        .select("id, codigo, nombre, marca_id")
        .eq("codigo", codigoNumerico)
        .eq("marca_id", marcaId)
        .maybeSingle();

      if (errorBusqueda) {
        console.error("❌ Error en búsqueda:", errorBusqueda);
        continue;
      }

      console.log("🔍 Resultado búsqueda (código + marca):", productoExistente);

      let productoId = productoExistente?.id;

      console.log("📝 Insertando detalle de venta:");
      console.log("  - venta_id:", ventaId);
      console.log("  - producto_id:", productoId);
      console.log("  - cantidad:", producto.cantidad);

      const { data: detalleInsertado, error: errorDetalle } = await supabase
        .from("detalle_ventas")
        .insert({
          venta_id: ventaId,
          producto_id: productoId,
          cantidad: producto.cantidad || 0,
          fecha_caducidad: null,
          ubicacion: null,
        })
        .select("*")
        .single();

      if (errorDetalle) {
        console.error("❌ Error insertando detalle:", errorDetalle);
        console.error("❌ Datos que se intentaron insertar:", {
          venta_id: ventaId,
          producto_id: productoId,
          cantidad: producto.cantidad || 0,
        });
      } else {
        console.log(
          "✅ Detalle de venta insertado correctamente:",
          detalleInsertado
        );
      }
    } catch (error) {
      console.error("❌ Error procesando producto:", producto.codigo, error);
    }
  }

  console.log("📋 Proceso completado");
};

export const uploadExcelToSupabase = async (excelFile) => {
  if (!excelFile) return null;

  const cleanFileName = excelFile.name
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/\s+/g, "_");

  const filePath = `facturas/${Date.now()}_${cleanFileName}`;
  const { error } = await supabase.storage
    .from("facturas")
    .upload(filePath, excelFile);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("facturas")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};
