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

  Swal.fire({
    icon: "success",
    title: "¡Producto creado!",
    text: "Producto creado correctamente.",
    timer: 2000,
    showConfirmButton: false,
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
      marcas(id, nombre),
      piso(cantidad)
    `
    )
    .order("id", { ascending: false });
  const productosConPiso =
    data?.map((producto) => ({
      ...producto,
      cantidad_piso:
        producto.piso?.reduce(
          (total, item) => total + (item.cantidad || 0),
          0
        ) || 0,
    })) || [];

  return productosConPiso;
}

export async function BuscarProductos(p) {
  // Si el valor de búsqueda es solo números, buscar por código
  const esNumero = !isNaN(p.buscador) && p.buscador.trim() !== "";

  let query = supabase.from(tabla).select(
    `
      id,
      codigo,
      nombre,
      cajas,
      cantidad,
      racks(id, codigo_rack),
      marcas(id, nombre),
      piso(cantidad)
    `
  );

  if (esNumero) {
    // Buscar por código (número exacto o que empiece con)
    query = query.or(
      `codigo.eq.${p.buscador},codigo::text.like.${p.buscador}%`
    );
  } else {
    // Buscar solo por nombre si no es número
    query = query.ilike("nombre", `%${p.buscador}%`);
  }

  const { data, error } = await query.order("id", { ascending: false });

  if (error) {
    console.error("Error en BuscarProductos:", error);
    return [];
  }

  const productosConPiso =
    data?.map((producto) => ({
      ...producto,
      cantidad_piso:
        producto.piso?.reduce(
          (total, item) => total + (item.cantidad || 0),
          0
        ) || 0,
    })) || [];

  return productosConPiso;
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

  Swal.fire({
    icon: "success",
    title: "¡Actualizado!",
    text: "Producto actualizado correctamente.",
    timer: 2000,
    showConfirmButton: false,
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
