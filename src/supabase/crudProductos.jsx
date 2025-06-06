import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "productos";

export async function InsertarProductos(p) {
  const { error } = await supabase.from(tabla).insert({
    codigo: p.codigo,
    nombre: p.nombre,
    marca_id: p.marca_id,
    cajas: p.cajas,
    cantidad: p.cantidad,
    racks: p.racks,
  });

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return false;
  }
  return true;
}

export async function MostrarProductos() {
  const { data } = await supabase
    .from(tabla)
    .select(
      `
      id,
      codigo,
      nombre,
      cajas,
      cantidad,
      racks(id, codigo_rack),
      marcas(id, nombre)
    `
    )
    .order("id", { ascending: false });
  return data;
}

export async function BuscarProductos(p) {
  const { data } = await supabase
    .from(tabla)
    .select()
    .or(
      `codigo.ilike.%${p.buscador}%,nombre.ilike.%${p.buscador}%,marca.ilike.%${p.buscador}%`
    );
  return data;
}

export async function EliminarProductos(p) {
  const { error } = await supabase.from(tabla).delete().eq("id", p.id);

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return false;
  }
  return true;
}

export async function EditarProductos(p) {
  const { error } = await supabase.from(tabla).update(p).eq("id", p.id);

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return false;
  }
  return true;
}
