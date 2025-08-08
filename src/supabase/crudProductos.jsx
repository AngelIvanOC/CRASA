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

export async function InsertarProductosMasivo(productos) {
  const { data, error } = await supabase.from(tabla).insert(productos).select();

  if (error) {
    console.error("Error en inserción masiva:", error);
    throw error;
  }

  return data;
}

export async function VerificarCodigosExistentes(codigos) {
  const { data, error } = await supabase
    .from(tabla)
    .select("codigo, marca_id")
    .in(
      "codigo",
      codigos.map((p) => p.codigo)
    );

  if (error) {
    console.error("Error verificando códigos:", error);
    return [];
  }

  return data?.map((item) => `${item.codigo}-${item.marca_id}`) || [];
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
      piso(cantidad),
      cajas(id, cantidad),
      suelto(id,cantidad)
    `
    )
    .order("id", { ascending: false });
  const productosConCalculos =
    data?.map((producto) => {
      const cantidad_piso =
        producto.piso?.reduce(
          (total, item) => total + (item.cantidad || 0),
          0
        ) || 0;

      const registrosPiso = Array.isArray(producto.piso)
        ? producto.piso.length
        : 0;

      const cantidad_suelto =
        producto.suelto?.reduce(
          (total, item) => total + (item.cantidad || 0),
          0
        ) || 0;

      const cajasConCantidad = Array.isArray(producto.cajas)
        ? producto.cajas.filter((caja) => caja.cantidad > 0).length
        : 0;

      const registrosSuelto = Array.isArray(producto.suelto)
        ? producto.suelto.length
        : 0;

      const totalTarimas = cajasConCantidad + registrosSuelto;

      return {
        ...producto,
        cantidad_piso,
        cantidad_suelto,
        tarimas: totalTarimas,
        total: cantidad_piso + cantidad_suelto + producto.cantidad,
      };
    }) || [];

  return productosConCalculos;
}

export async function BuscarProductos(p) {
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
      piso(cantidad),
      cajas(id, cantidad),
      suelto(id,cantidad)
    `
  );

  if (esNumero) {
    query = query.or(
      `codigo.eq.${p.buscador},codigo::text.like.${p.buscador}%`
    );
  } else {
    query = query.ilike("nombre", `%${p.buscador}%`);
  }

  const { data, error } = await query.order("id", { ascending: false });

  if (error) {
    console.error("Error en BuscarProductos:", error);
    return [];
  }

  const productosConCalculos =
    data?.map((producto) => {
      const cantidad_piso =
        producto.piso?.reduce(
          (total, item) => total + (item.cantidad || 0),
          0
        ) || 0;

      const registrosPiso = Array.isArray(producto.piso)
        ? producto.piso.length
        : 0;

      const cantidad_suelto =
        producto.suelto?.reduce(
          (total, item) => total + (item.cantidad || 0),
          0
        ) || 0;

      const cajasConCantidad = Array.isArray(producto.cajas)
        ? producto.cajas.filter((caja) => caja.cantidad > 0).length
        : 0;

      const registrosSuelto = Array.isArray(producto.suelto)
        ? producto.suelto.length
        : 0;

      const totalTarimas = cajasConCantidad + registrosSuelto;

      return {
        ...producto,
        cantidad_piso,
        cantidad_suelto,
        tarimas: totalTarimas,
        total: cantidad_piso + cantidad_suelto + producto.cantidad,
      };
    }) || [];

  return productosConCalculos;
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
