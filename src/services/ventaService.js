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

      const { data: productosExistentes, error: errorBusqueda } =
        await supabase
          .from("productos")
          .select("id, codigo, nombre, marca_id")
          .eq("codigo", codigoNumerico)
          .eq("marca_id", marcaId)
          .order("id", { ascending: true });

      if (errorBusqueda) {
        console.error("❌ Error en búsqueda:", errorBusqueda);
        continue;
      }

      if (productosExistentes?.length > 1) {
        console.warn(
          `⚠️ Código ${producto.codigo} (marca_id ${marcaId}) tiene ${productosExistentes.length} productos duplicados en el catálogo - usando el primero (id ${productosExistentes[0].id})`
        );
      }

      const productoId = productosExistentes?.[0]?.id;

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

      const { data: productosExistentes, error: errorBusqueda } =
        await supabase
          .from("productos")
          .select("id, codigo, nombre, marca_id")
          .eq("codigo", codigoNumerico)
          .eq("marca_id", marcaId)
          .order("id", { ascending: true });

      if (errorBusqueda) {
        console.error("❌ Error en búsqueda:", errorBusqueda);
        continue;
      }

      if (productosExistentes?.length > 1) {
        console.warn(
          `⚠️ Código ${producto.codigo} (marca_id ${marcaId}) tiene ${productosExistentes.length} productos duplicados en el catálogo - usando el primero (id ${productosExistentes[0].id})`
        );
      }

      const productoId = productosExistentes?.[0]?.id;

      if (!productoId) {
        console.warn(
          `❌ Producto con código ${producto.codigo} no existe - omitiendo`
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
        console.error("❌ Error insertando detalle:", errorDetalle);
      }
    } catch (error) {
      console.error("❌ Error procesando producto:", producto.codigo, error);
    }
  }
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
