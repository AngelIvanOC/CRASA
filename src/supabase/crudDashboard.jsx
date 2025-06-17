import Swal from "sweetalert2";
import { supabase } from "../index";

export async function MostrarVentasPorMarca() {
  try {
    const { data, error } = await supabase
      .from("marcas")
      .select(
        `
        id,
        nombre,
        ventas(id)
      `
      )
      .order("nombre");

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar ventas",
        text: error.message,
      });
      return [];
    }

    // Procesar datos para obtener el conteo
    const ventasProcesadas = data.map((marca) => ({
      nombre: marca.nombre,
      cantidad: marca.ventas.length,
    }));

    return ventasProcesadas;
  } catch (error) {
    console.error("Error en MostrarVentasPorMarca:", error);
    return [];
  }
}

export async function MostrarRacksPorMarca() {
  try {
    const { data, error } = await supabase
      .from("marcas")
      .select(
        `
        id,
        nombre,
        racks(id)
      `
      )
      .order("nombre");

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar racks",
        text: error.message,
      });
      return [];
    }

    // Procesar datos para obtener el conteo
    const racksProcesados = data.map((marca) => ({
      nombre: marca.nombre,
      cantidad: marca.racks.length,
    }));

    return racksProcesados;
  } catch (error) {
    console.error("Error en MostrarRacksPorMarca:", error);
    return [];
  }
}

export async function MostrarComprasPorMarca() {
  try {
    const { data, error } = await supabase
      .from("marcas")
      .select(
        `
        id,
        nombre,
        compras(id)
      `
      )
      .order("nombre");

    if (error) {
      // Si no existe tabla compras, devolver array vacío sin error
      console.warn("Tabla compras no encontrada o sin datos");
      return [];
    }

    const comprasProcesadas = data.map((marca) => ({
      nombre: marca.nombre,
      cantidad: marca.compras.length,
    }));

    return comprasProcesadas;
  } catch (error) {
    console.error("Error en MostrarComprasPorMarca:", error);
    return [];
  }
}

export async function MostrarProductosPorMarca() {
  try {
    const { data, error } = await supabase
      .from("marcas")
      .select(
        `
        id,
        nombre,
        productos(id)
      `
      )
      .order("nombre");

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar productos",
        text: error.message,
      });
      return [];
    }

    const productosProcesados = data.map((marca) => ({
      nombre: marca.nombre,
      cantidad: marca.productos.length,
    }));

    return productosProcesados;
  } catch (error) {
    console.error("Error en MostrarProductosPorMarca:", error);
    return [];
  }
}
