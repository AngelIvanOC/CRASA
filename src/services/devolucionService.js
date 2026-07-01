import { supabase } from "../index";
import { useVentasStore } from "../index";

const mapaMarcas = {
  CRASA: 1,
  JUMEX: 2,
  "LA COSTEÑA": 3,
  "CON ALIMENTOS": 4,
};

export const validarProductosEnMarca = async (productos) => {
  const codigosNoEncontrados = [];

  for (const producto of productos) {
    const codigoNumerico = parseInt(producto.codigo);
    const marcaId = mapaMarcas[producto.marca?.toUpperCase()] ?? null;

    if (!codigoNumerico || isNaN(codigoNumerico) || marcaId === null) {
      codigosNoEncontrados.push(producto.codigo);
      continue;
    }

    const { data: productoExistente, error } = await supabase
      .from("productos")
      .select("id")
      .eq("codigo", codigoNumerico)
      .eq("marca_id", marcaId)
      .maybeSingle();

    if (error || !productoExistente) {
      codigosNoEncontrados.push(producto.codigo);
    }
  }

  return codigosNoEncontrados;
};

const uploadDevolucionPdfToSupabase = async (pdfFile) => {
  if (!pdfFile) return null;

  const filePath = `devoluciones/${Date.now()}_${pdfFile.name}`;
  const { error } = await supabase.storage
    .from("facturas")
    .upload(filePath, pdfFile);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("facturas")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

const detectarMarcaPrincipal = async (productos) => {
  const contadorMarcas = {};

  for (const producto of productos) {
    const marca = producto.marca?.toUpperCase();
    const marcaId = mapaMarcas[marca] ?? null;

    if (marcaId) {
      contadorMarcas[marcaId] =
        (contadorMarcas[marcaId] || 0) + (producto.cantidad || 1);
    }
  }

  let marcaPrincipal = null;
  let maxCantidad = 0;

  for (const [marcaId, cantidad] of Object.entries(contadorMarcas)) {
    if (cantidad > maxCantidad) {
      maxCantidad = cantidad;
      marcaPrincipal = parseInt(marcaId);
    }
  }

  return marcaPrincipal || 1;
};

export const insertDevolucionWithProducts = async (extractedData, pdfFile) => {
  if (!extractedData?.productos?.length) {
    throw new Error("No hay productos para procesar en la devolución");
  }

  let pdfUrl = null;
  if (pdfFile) {
    try {
      pdfUrl = await uploadDevolucionPdfToSupabase(pdfFile);
    } catch (error) {
      console.error("❌ Error subiendo PDF:", error);
    }
  }

  const marcaPrincipal = await detectarMarcaPrincipal(extractedData.productos);

  const { insertarDevolucion } = useVentasStore.getState();

  const devolucionData = {
    codigo: extractedData.pedidoNo || `${Date.now()}`,
    marca_id: marcaPrincipal,
    fecha: extractedData.fecha || new Date().toISOString().split("T")[0],

    factura_url: pdfUrl,
  };

  const idDevolucion = await insertarDevolucion(devolucionData);

  if (!idDevolucion) {
    throw new Error("No se pudo registrar la devolución en ventas");
  }

  await insertProductsToVentas(extractedData.productos, idDevolucion);

  await insertProductsToPiso(extractedData.productos);

  return idDevolucion;
};

const insertProductsToVentas = async (productos, ventaId) => {
  for (const producto of productos) {
    try {
      const codigoNumerico = parseInt(producto.codigo);
      const marcaId = mapaMarcas[producto.marca?.toUpperCase()] ?? null;

      if (!codigoNumerico || isNaN(codigoNumerico) || marcaId === null) {
        continue;
      }

      const { data: productoExistente, error: errorBusqueda } = await supabase
        .from("productos")
        .select("id")
        .eq("codigo", codigoNumerico)
        .eq("marca_id", marcaId)
        .maybeSingle();

      if (errorBusqueda || !productoExistente) {
        continue;
      }

      const { error: errorDetalle } = await supabase
        .from("detalle_ventas")
        .insert({
          venta_id: ventaId,
          producto_id: productoExistente.id,
          cantidad: producto.cantidad || 1,
          fecha_caducidad: null,
          ubicacion: "devolucion",
        });

      if (errorDetalle) {
        console.error("❌ Error insertando detalle de devolución:", errorDetalle);
      }
    } catch (error) {
      console.error(
        "❌ Error procesando producto para ventas:",
        producto.codigo,
        error
      );
    }
  }
};

const insertProductsToPiso = async (productos) => {
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
        .select("id")
        .eq("codigo", codigoNumerico)
        .eq("marca_id", marcaId)
        .maybeSingle();

      if (errorBusqueda || !productoExistente) {
        console.error("❌ Producto no encontrado para código:", codigoNumerico);
        continue;
      }

      const productoId = productoExistente.id;

      const { data: pisoInsertado, error: errorPiso } = await supabase
        .from("piso")
        .insert({
          producto_id: productoId,
          cantidad: producto.cantidad || 1,
          fecha_caducidad: null,
          codigo_barras: `devolucion`,
        })
        .select("*")
        .single();

      if (errorPiso) {
        console.error("❌ Error insertando en piso:", errorPiso);
      }
    } catch (error) {
      console.error("❌ Error procesando producto:", producto.codigo, error);
    }
  }

};
