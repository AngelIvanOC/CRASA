import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "racks";

export async function InsertarRack(p) {
  const { data: compraExistente, error: errorVerificacion } = await supabase
    .from(tabla)
    .select("id")
    .eq("codigo_rack", p.codigo_rack)
    .maybeSingle();

  Swal.fire({
    icon: "success",
    title: "¡Rack creado!",
    text: "Rack creado correctamente.",
    timer: 2000,
    showConfirmButton: false,
  });

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
      title: "Rack duplicado",
      text: "Ya existe un rack con ese código.",
    });
    return null;
  }

  const { error } = await supabase.from(tabla).insert({
    marca_id: p.marca_id,
    nivel: p.nivel,
    posicion: p.posicion,
    lado: p.lado,
    codigo_rack: p.codigo_rack,
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

export async function MostrarRacks() {
  const { data, error } = await supabase
    .from("racks")
    .select(
      `
      id,
      codigo_rack,
      nivel,
      posicion,
      lado,
      marcas(id, nombre),
      cajas(
        id,
        cantidad,
        fecha_caducidad,
        codigo_barras,
        producto:producto_id (
          id,
          nombre,
          codigo
        )
      )
    `
    )
    .order("id", { ascending: false });

  if (error) {
    console.error("Error al obtener racks:", error);
    return [];
  }

  const racksProcesados = data.map((rack) => {
    const cajas = rack.cajas || [];

    const productosUnicos = cajas
      .map((caja) => caja.producto)
      .filter((prod) => prod !== null);

    return {
      ...rack,
      ocupado: cajas.length > 0,
      productos_info: productosUnicos,
    };
  });

  return racksProcesados;
}

export async function BuscarRacks(p) {
  const { data } = await supabase
    .from(tabla)
    .select(
      `
      id,
      codigo_rack,
      nivel,
      posicion,
      lado,
      marcas(id, nombre),
      productos!productos_rack_id_fkey(
        id,
        codigo,
        nombre,
        cantidad
      )
    `
    )
    .or(`codigo_rack.ilike.%${p.buscador}%,posicion.ilike.%${p.buscador}%`);

  // Procesar los datos igual que en MostrarRacks
  const racksConOcupacion =
    data?.map((rack) => ({
      ...rack,
      ocupado: rack.productos && rack.productos.length > 0,
      total_productos: rack.productos?.length || 0,
      productos_info: rack.productos || [],
    })) || [];

  return racksConOcupacion;
}

export async function EliminarRack(p) {
  // Verificar si el rack tiene productos antes de eliminar
  const { data: productosEnRack } = await supabase
    .from("productos")
    .select("id")
    .eq("rack_id", p.id);

  if (productosEnRack && productosEnRack.length > 0) {
    Swal.fire({
      icon: "warning",
      title: "No se puede eliminar",
      text: `Este rack tiene ${productosEnRack.length} producto(s) asignado(s). Mueve o elimina los productos primero.`,
    });
    return false;
  }

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

export async function EditarRack(p) {
  console.log("Editando rack con:", p);

  Swal.fire({
    icon: "success",
    title: "¡Actualizado!",
    text: "Rack actualizado correctamente.",
    timer: 2000,
    showConfirmButton: false,
  });

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

// Función adicional para obtener detalles específicos de un rack
export async function ObtenerDetalleRack(rackId) {
  const { data, error } = await supabase
    .from(tabla)
    .select(
      `
      *,
      marcas(nombre),
      productos!productos_racks_fkey(
        id,
        codigo,
        nombre,
        cantidad,
        cajas
      )
    `
    )
    .eq("id", rackId)
    .single();

  if (error) {
    console.error("Error al obtener detalle del rack:", error);
    return null;
  }

  return {
    ...data,
    ocupado: data.productos && data.productos.length > 0,
    total_productos: data.productos?.length || 0,
  };
}
