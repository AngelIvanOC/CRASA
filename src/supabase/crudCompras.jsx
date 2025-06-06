import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "compras";
const tablaDetalle = "detalle_compras";

export async function MostrarCompras() {
  const { data } = await supabase
    .from(tabla)
    .select(
      `
      id,
      codigo,
      cantidad_productos,
      cantidad_total,
      fecha,
      factura_url,
      marcas(id, nombre)
    `
    )
    .order("fecha", { ascending: false });
  return data;
}

export async function InsertarCompra(p) {
  const { data: compraExistente, error: errorVerificacion } = await supabase
    .from("compras")
    .select("id")
    .eq("codigo", p.codigo)
    .maybeSingle();

  if (errorVerificacion) {
    Swal.fire({
      icon: "error",
      title: "Error al verificar",
      text: errorVerificacion.message,
    });
    return null;
  }

  if (compraExistente) {
    Swal.fire({
      icon: "warning",
      title: "Compra duplicada",
      text: "Ya existe una compra con ese código.",
    });
    return null;
  }

  const { data, error } = await supabase
    .from("compras")
    .insert(p)
    .select("id")
    .single();

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Error al insertar",
      text: error.message,
    });
    return null;
  }

  return data?.id; // ✅ regresa el id insertado
}

export async function EditarCompra(p) {
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

export async function MostrarDetalleCompra(compra_id) {
  const { data } = await supabase
    .from(tablaDetalle)
    .select(
      `
      id,
      cantidad,
      fecha_caducidad,
      ubicacion,
      productos(id, codigo, nombre, racks(id, codigo_rack))
    `
    )
    .eq("compra_id", compra_id);
  return data;
}

export async function InsertarProductosCompra(p) {
  // Verificar si ya existe una compra con ese código

  const { error } = await supabase.from(tablaDetalle).insert({
    compra_id: p.compra_id,
    producto_id: p.producto_id,
    cantidad: p.cantidad,
    fecha_caducidad: p.fecha_caducidad,
    ubicacion: p.ubicacion,
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

export async function EliminarCompra(p) {
  // Primero eliminar el detalle
  const { error: errorDetalle } = await supabase
    .from(tablaDetalle)
    .delete()
    .eq("compra_id", p.id);

  if (errorDetalle) {
    throw errorDetalle;
  }

  // Luego eliminar la compra
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
