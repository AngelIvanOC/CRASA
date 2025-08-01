import { supabase } from "../index";

// Mapeo de marcas
const mapaMarcas = {
  CRASA: 1,
  JUMEX: 2,
  "LA COSTEÑA": 3,
  "CON ALIMENTOS": 4,
};

/**
 * Valida si los productos existen en la marca correspondiente.
 * Devuelve un array con los códigos no encontrados.
 */
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

/**
 * Inserta productos válidos directamente en la tabla "piso".
 * Lanza error si no hay productos válidos.
 */
export const insertDevolucionWithProducts = async (extractedData) => {
  if (!extractedData?.productos?.length) {
    throw new Error("No hay productos para procesar en la devolución");
  }

  await insertProductsToPiso(extractedData.productos);
};

/**
 * Inserta productos en la tabla "piso"
 */
const insertProductsToPiso = async (productos) => {
  console.log("🔍 Insertando productos en piso desde devolución");
  console.log("📦 Total de productos a procesar:", productos.length);

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
          cantidad: producto.cantidad || 0,
          fecha_caducidad: null,
          codigo_barras: "devolucion", // 🔥 Marca como devolución
        })
        .select("*")
        .single();

      if (errorPiso) {
        console.error("❌ Error insertando en piso:", errorPiso);
      } else {
        console.log("✅ Producto insertado en piso:", pisoInsertado);
      }
    } catch (error) {
      console.error("❌ Error procesando producto:", producto.codigo, error);
    }
  }

  console.log("📋 Proceso de inserción en piso completado");
};
