import { supabase } from "../index";
import Swal from "sweetalert2";

const tabla = "cajas";

export async function ObtenerCajasPorProducto(producto_id) {
  try {
    const { data: cajas } = await supabase
      .from("cajas")
      .select(
        `
        *,
        racks (codigo_rack)
      `
      )
      .eq("producto_id", producto_id)
      .gt("cantidad", 0);

    const { data: sueltos } = await supabase
      .from("suelto")
      .select("*")
      .eq("producto_id", producto_id)
      .gt("cantidad", 0);

    const { data: pisos } = await supabase
      .from("piso")
      .select("*")
      .eq("producto_id", producto_id)
      .gt("cantidad", 0);

    const cajasFormateadas = (cajas || []).map((caja) => ({
      ...caja,
      tipo: "caja",
      ubicacion: caja.racks?.codigo_rack || "-",
    }));

    const sueltosFormateados = (sueltos || []).map((suelto) => ({
      ...suelto,
      tipo: "suelto",
      ubicacion: "SUELTO",
      racks: null,
      rack_id: null,
    }));

    const pisosFormateados = (pisos || []).map((piso) => ({
      ...piso,
      tipo: "piso",
      ubicacion: "EN PISO",
      racks: null,
      rack_id: null,
      fecha_entrada: null,
    }));

    const todosLosRegistros = [
      ...cajasFormateadas,
      ...sueltosFormateados,
      ...pisosFormateados,
    ].sort((a, b) => {
      const fechaA = a.fecha_entrada ? new Date(a.fecha_entrada) : new Date(0);
      const fechaB = b.fecha_entrada ? new Date(b.fecha_entrada) : new Date(0);
      return fechaB - fechaA;
    });

    return todosLosRegistros;
  } catch (error) {
    console.error("Error al obtener registros:", error);
    throw error;
  }
}

export async function InsertarCaja(caja) {
  const { data, error } = await supabase.from("cajas").insert([caja]).select();

  if (error) throw error;
  return data;
}

export async function InsertarSuelto(suelto) {
  const { data, error } = await supabase
    .from("suelto")
    .insert([suelto])
    .select();

  if (error) throw error;
  return data;
}

export async function InsertarPiso(piso) {
  const { data, error } = await supabase.from("piso").insert([piso]).select();

  if (error) throw error;
  return data;
}

export async function EditarCaja(caja) {
  const { data, error } = await supabase
    .from("cajas")
    .update(caja)
    .eq("id", caja.id)
    .select();

  if (error) throw error;
  return data;
}

export async function EditarSuelto(suelto) {
  const { data, error } = await supabase
    .from("suelto")
    .update(suelto)
    .eq("id", suelto.id)
    .select();

  if (error) throw error;
  return data;
}

export async function EditarPiso(piso) {
  const { data, error } = await supabase
    .from("piso")
    .update(piso)
    .eq("id", piso.id)
    .select();

  if (error) throw error;
  return data;
}
