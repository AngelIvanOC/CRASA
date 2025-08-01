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
      /*if (!productoId) {
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
      }*/

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

// Agregar estas funciones a tu ventaService.js existente

export const insertVentaWithExcelProducts = async (
  ventaData,
  extractedData,
  insertarVenta,
  excelFile
) => {
  const excelUrl = await uploadExcelToSupabase(excelFile);

  // 1. Insertar venta principal con datos del Excel
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

  // 2. Insertar productos desde Excel
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
      // Asegurar que el código sea un número entero
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

      // Validar que el código sea válido
      if (!codigoNumerico || isNaN(codigoNumerico)) {
        console.error("❌ Código inválido:", producto.codigo);
        continue;
      }

      const marcaId = mapaMarcas[producto.marca?.toUpperCase()] ?? null;

      if (marcaId === null) {
        console.error("❌ Marca desconocida:", producto.marca);
        continue;
      }

      // ✅ BUSCAR PRODUCTO EXISTENTE CON MISMO CÓDIGO Y MARCA
      const { data: productoExistente, error: errorBusqueda } = await supabase
        .from("productos")
        .select("id, codigo, nombre, marca_id")
        .eq("codigo", codigoNumerico)
        .eq("marca_id", marcaId) // 🔥 FILTRAR TAMBIÉN POR MARCA
        .maybeSingle();

      if (errorBusqueda) {
        console.error("❌ Error en búsqueda:", errorBusqueda);
        continue;
      }

      console.log("🔍 Resultado búsqueda (código + marca):", productoExistente);

      let productoId = productoExistente?.id;

      /* Crear producto si no existe
      if (!productoId) {
        console.log(
          "➕ Creando nuevo producto con código:",
          codigoNumerico,
          "y marca:",
          marcaId
        );

        const { data: nuevoProducto, error: errorProducto } = await supabase
          .from("productos")
          .insert({
            codigo: codigoNumerico,
            nombre: `Producto ${codigoNumerico}`,
            marca_id: marcaId,
          })
          .select("id")
          .single();

        if (errorProducto) {
          console.error("❌ Error creando producto:", errorProducto);
          continue;
        }

        productoId = nuevoProducto.id;
        console.log("✅ Producto creado con ID:", productoId);
      } else {
        console.log("✅ Producto existente encontrado con ID:", productoId);
      }

      // ✅ VERIFICAR QUE TENEMOS UN PRODUCTO_ID VÁLIDO
      if (!productoId) {
        console.error(
          "❌ No se pudo obtener producto_id para código:",
          codigoNumerico
        );
        continue;
      }*/

      // Insertar detalle de venta con producto_id válido
      console.log("📝 Insertando detalle de venta:");
      console.log("  - venta_id:", ventaId);
      console.log("  - producto_id:", productoId);
      console.log("  - cantidad:", producto.cantidad);

      const { data: detalleInsertado, error: errorDetalle } = await supabase
        .from("detalle_ventas")
        .insert({
          venta_id: ventaId,
          producto_id: productoId, // ✅ Este debería ser un número válido
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

  // Al final, mostrar un resumen
  console.log("📋 Proceso completado");
};

// Nueva función para subir Excel
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
