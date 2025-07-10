import { supabase } from "../index";
import Swal from "sweetalert2";

const tabla = "cajas";

export async function ObtenerCajasPorProducto(producto_id) {
  const { data, error } = await supabase
    .from(tabla)
    .select(
      `
      id,
      cantidad,
      fecha_caducidad,
      codigo_barras,
      fecha_entrada,
      racks(id, codigo_rack)
    `
    )
    .eq("producto_id", producto_id)
    .order("fecha_entrada", { ascending: false });

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Error al obtener cajas",
      text: error.message,
    });
    return [];
  }

  return data;
}
