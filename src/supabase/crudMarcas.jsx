import { supabase } from "../index";

import Swal from "sweetalert2";

const tabla = "marcas";

export async function InsertarMarca(p) {
  const { error } = await supabase.from(tabla).insert(p);

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

// Corrige MostrarMarcas():
export async function MostrarMarcas() {
  const { data } = await supabase
    .from(tabla)
    .select()
    .order("id", { ascending: false });
  return data;
}
