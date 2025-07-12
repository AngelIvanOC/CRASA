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
        productos(
          nombre,
          cajas (id)
        )
      `
      )
      .order("nombre");
    if (error) {
      // Si no existe tabla compras, devolver array vacío sin error
      console.warn("Tabla compras no encontrada o sin datos");
      return [];
    }
    const comprasProcesadas = data.map((marca) => {
      const totalCajas = marca.productos?.reduce((acc, producto) => {
        return acc + (producto.cajas?.length || 0);
      }, 0);

      return {
        nombre: marca.nombre,
        cantidad: totalCajas,
      };
    });
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

export async function MostrarProximosACaducar() {
  const { data, error } = await supabase
    .from("cajas")
    .select(
      `
    id,
    fecha_caducidad,
    productos (
      nombre,
      marcas (
        nombre
      )
    )
  `
    )
    .lte(
      "fecha_caducidad",
      new Date(new Date().setDate(new Date().getDate() + 15)).toISOString()
    )
    .order("fecha_caducidad", { ascending: true })
    .limit(4);

  if (error) {
    console.error("Error al cargar próximos a caducar:", error);
    return [];
  }

  // Procesar los datos para devolver lo necesario
  const hoy = new Date();
  const procesados = data.map((caja) => {
    const dias = Math.ceil(
      (new Date(caja.fecha_caducidad) - hoy) / (1000 * 60 * 60 * 24)
    );
    return {
      producto: caja.productos?.nombre || "Producto sin nombre",
      marca: caja.productos?.marcas?.nombre || "Sin marca",
      dias,
    };
  });

  return procesados;
}

export async function MostrarMovimientosRecientes() {
  try {
    // Obtener las últimas 3 entradas (cajas)
    const { data: entradas, error: errorEntradas } = await supabase
      .from("cajas")
      .select(
        `
        id,
        cantidad,
        fecha_entrada,
        codigo_barras,
        productos (
          nombre,
          marcas (
            nombre
          )
        ),
        racks (
          codigo_rack
        )
      `
      )
      .order("fecha_entrada", { ascending: false })
      .limit(4);

    if (errorEntradas) {
      console.error("Error al cargar entradas:", errorEntradas);
    }

    // Obtener las últimas 2 ventas completadas
    const { data: ventas, error: errorVentas } = await supabase
      .from("ventas")
      .select(
        `
        id,
        codigo,
        cantidad_total,
        fecha,
        marcas (
          nombre
        )
      `
      )
      .eq("estado", "completado")
      .order("fecha", { ascending: false })
      .limit(4);

    if (errorVentas) {
      console.error("Error al cargar ventas:", errorVentas);
    }

    // Formatear entradas
    const entradasFormateadas = (entradas || []).map((entrada) => ({
      id: `E-${entrada.id}`,
      pedido: entrada.codigo_barras,
      cantidad: entrada.cantidad || 0,
      almacen: entrada.racks?.nombre || "Sin asignar",
      fecha: entrada.fecha_entrada,
      tipo: "entrada",
      marca: entrada.productos?.marcas?.nombre || "Sin marca",
    }));

    // Formatear ventas
    const ventasFormateadas = (ventas || []).map((venta) => ({
      id: `V-${venta.id}`,
      pedido: venta.codigo || `V-${venta.id}`,
      cantidad: venta.cantidad_total || 0,
      almacen: venta.marcas?.nombre || "Sin marca",
      fecha: venta.fecha,
      tipo: "venta",
      marca: venta.marcas?.nombre || "Sin marca",
    }));

    // Combinar y ordenar por fecha
    const movimientos = [...entradasFormateadas, ...ventasFormateadas]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5); // Limitar a 5 movimientos más recientes

    // Formatear fecha para mostrar
    const opcionesFecha = { day: "2-digit", month: "short" };
    const hoy = new Date();

    return movimientos.map((mov) => {
      const fechaMovimiento = new Date(mov.fecha);
      const esHoy = fechaMovimiento.toDateString() === hoy.toDateString();
      const fechaFormateada = esHoy
        ? "Hoy"
        : fechaMovimiento.toLocaleDateString("es-MX", opcionesFecha);

      return {
        pedido: mov.pedido,
        cantidad: mov.cantidad.toLocaleString(),
        almacen: mov.almacen,
        dia: fechaFormateada,
        tipo: mov.tipo,
        marca: mov.marca,
      };
    });
  } catch (error) {
    console.error("Error en MostrarMovimientosRecientes:", error);
    return [];
  }
}

export async function MostrarPedidosActivos() {
  const { data, error } = await supabase
    .from("ventas")
    .select(
      `
      id,
      codigo,
      estado,
      fecha,
      marcas (
        nombre
      )
    `
    )
    .not("estado", "eq", "completado")
    .order("fecha", { ascending: false })
    .limit(4);
  if (error) {
    console.error("Error al cargar pedidos activos:", error);
    return [];
  }

  // Formatear fecha al estilo "25 abr"
  const opcionesFecha = { day: "2-digit", month: "short" };
  const pedidos = data.map((venta) => {
    const fecha = venta.fecha
      ? new Date(venta.fecha).toLocaleDateString("es-MX", opcionesFecha)
      : null;

    return {
      codigo: venta.codigo || "Sin código",
      marca: venta.marcas?.nombre || "Sin marca",
      estado: venta.estado,
      fecha: fecha,
    };
  });

  return pedidos;
}

export async function MostrarPedidosPorFecha() {
  try {
    const { data, error } = await supabase
      .from("ventas")
      .select("fecha")
      .not("fecha", "is", null)
      .order("fecha", { ascending: true });

    if (error) {
      console.error("Error al cargar pedidos por fecha:", error);
      return [];
    }

    // Agrupar por mes y contar
    const pedidosPorMes = {};
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    // Inicializar todos los meses con 0
    meses.forEach((mes) => {
      pedidosPorMes[mes] = 0;
    });

    // Contar pedidos por mes
    data.forEach((venta) => {
      const fecha = new Date(venta.fecha);
      const mes = meses[fecha.getMonth()];
      pedidosPorMes[mes]++;
    });

    // Convertir a formato requerido para el gráfico
    const resultado = meses.map((mes) => ({
      mes,
      cantidad: pedidosPorMes[mes],
    }));

    return resultado;
  } catch (error) {
    console.error("Error en MostrarPedidosPorFecha:", error);
    return [];
  }
}

export async function MostrarEntradasPorSemana() {
  try {
    const { data, error } = await supabase
      .from("cajas")
      .select(
        `
        id,
        fecha_entrada,
        productos (
          marcas (
            nombre
          )
        )
      `
      )
      .not("fecha_entrada", "is", null)
      .gte(
        "fecha_entrada",
        new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()
      )
      .order("fecha_entrada", { ascending: false });

    if (error) {
      console.error("Error al cargar entradas por semana:", error);
      return [];
    }

    // Contar entradas por marca
    const entradasPorMarca = {};
    let totalEntradas = 0;

    data.forEach((entrada) => {
      const nombreMarca = entrada.productos?.marcas?.nombre || "Sin marca";
      entradasPorMarca[nombreMarca] = (entradasPorMarca[nombreMarca] || 0) + 1;
      totalEntradas++;
    });

    // Convertir a formato para el gráfico de pastel
    const resultado = Object.entries(entradasPorMarca)
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        porcentaje: ((cantidad / totalEntradas) * 100).toFixed(1),
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return { data: resultado, total: totalEntradas };
  } catch (error) {
    console.error("Error en MostrarEntradasPorSemana:", error);
    return { data: [], total: 0 };
  }
}
