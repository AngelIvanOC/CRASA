import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "ventas";
const tablaDetalle = "detalle_ventas";

export async function MostrarVentas() {
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

export async function InsertarVenta(p) {
  const { data: ventaExistente, error: errorVerificacion } = await supabase
    .from(tabla)
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

  if (ventaExistente) {
    Swal.fire({
      icon: "warning",
      title: "Venta duplicada",
      text: "Ya existe una venta con ese código.",
    });
    return null;
  }

  const { data, error } = await supabase
    .from(tabla)
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

export async function EditarVenta(p) {
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

export async function MostrarDetalleVenta(venta_id) {
  const { data, error } = await supabase
    .from(tablaDetalle)
    .select(
      `
      id,
      cantidad,
      fecha_caducidad,
      ubicacion,
      productos:producto_id(id, codigo, nombre, marca_id, racks(id, codigo_rack))
    `
    )
    .eq("venta_id", venta_id);

  if (error) {
    console.error("Error fetching venta details:", error);
    throw error;
  }

  return data;
}

export async function InsertarProductosVenta(p) {
  // Verificar si ya existe una compra con ese código

  const { error } = await supabase.from(tablaDetalle).insert({
    venta_id: p.venta_id,
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

export async function EliminarVenta(p) {
  // Primero eliminar el detalle
  const { error: errorDetalle } = await supabase
    .from(tablaDetalle)
    .delete()
    .eq("venta_id", p.id);

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
