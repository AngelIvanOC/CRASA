import { supabase } from "../index";
import Swal from "sweetalert2";

const tabla = "piso";

export async function ObtenerPisoPorProducto(producto_id) {
  const { data, error } = await supabase
    .from(tabla)
    .select(
      `
      id,
      cantidad,
      fecha_caducidad,
      codigo_barras,
      created_at
    `
    )
    .eq("producto_id", producto_id)
    .order("created_at", { ascending: false });

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Error al obtener productos en piso",
      text: error.message,
    });
    return [];
  }
  return data;
}

export async function InsertarPiso(piso) {
  const { data, error } = await supabase.from("piso").insert([piso]).select();

  if (error) {
    throw new Error(error.message);
  }

  Swal.fire({
    icon: "success",
    title: "¡Producto en piso creado!",
    text: "Producto en piso creado correctamente.",
    timer: 2000,
    showConfirmButton: false,
  });
  return data[0];
}

export async function EditarPiso(piso) {
  const { id, ...rest } = piso;
  const { data, error } = await supabase
    .from("piso")
    .update(rest)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);

  Swal.fire({
    icon: "success",
    title: "¡Actualizado!",
    text: "Producto en piso actualizado correctamente.",
    timer: 2000,
    showConfirmButton: false,
  });
  return data[0];
}

export async function EliminarPiso(id) {
  const { error } = await supabase.from("piso").delete().eq("id", id);

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
    return false;
  }

  Swal.fire({
    icon: "success",
    title: "¡Eliminado!",
    text: "Producto en piso eliminado correctamente.",
    timer: 2000,
    showConfirmButton: false,
  });
  return true;
}
