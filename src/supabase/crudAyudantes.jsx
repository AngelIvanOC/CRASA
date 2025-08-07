import { supabase } from "../index";

// Función para obtener ayudantes de una venta
export async function MostrarAyudantesVenta(venta_id) {
  const { data, error } = await supabase
    .from("ayudantes_venta")
    .select(
      `
      usuario_id,
      fecha_asignacion,
      usuarios!inner(id, nombres, id_auth)
    `
    )
    .eq("venta_id", venta_id);

  if (error) {
    console.error("Error fetching ayudantes:", error);
    return [];
  }

  return data;
}

// Función para insertar ayudantes de una venta
export async function InsertarAyudantesVenta(venta_id, ayudantes) {
  if (!ayudantes || ayudantes.length === 0) return true;

  const ayudantesData = ayudantes.map((usuario_id) => ({
    venta_id,
    usuario_id,
  }));

  const { error } = await supabase
    .from("ayudantes_venta")
    .insert(ayudantesData);

  if (error) {
    console.error("Error insertando ayudantes:", error);
    return false;
  }

  return true;
}

// Función para eliminar ayudantes de una venta
export async function EliminarAyudantesVenta(venta_id) {
  const { error } = await supabase
    .from("ayudantes_venta")
    .delete()
    .eq("venta_id", venta_id);

  if (error) {
    console.error("Error eliminando ayudantes:", error);
    return false;
  }

  return true;
}

/* Actualizar la función MostrarVentas para incluir ayudantes
export async function MostrarVentas() {
  const { data } = await supabase
    .from("ventas")
    .select(
      `
      id,
      codigo,
      cantidad_productos,
      cantidad_total,
      fecha,
      factura_url,
      marcas(id, nombre),
      usuarios(id, nombres),
      ayudantes_venta(
        usuario_id,
        usuarios!inner(nombres)
      )
    `
    )
    .order("fecha", { ascending: false });

  return data;
}*/
