import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "usuarios";

export async function MostrarUsuarios(p) {
  const { data } = await supabase
    .from(tabla)
    .select()
    .eq("id_auth", p.id_auth)
    .maybeSingle();
  return data;
}

// Nueva función para obtener usuario con información del rol
export async function MostrarUsuarioConRol(p) {
  const { data } = await supabase
    .from(tabla)
    .select(
      `
      *,
      roles:id_rol(
        id,
        nombre
      )
    `
    )
    .eq("id_auth", p.id_auth)
    .maybeSingle();
  return data;
}

export async function InsertarAdmin(p) {
  const { error } = await supabase.from(tabla).insert(p);

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return;
  }
}

export async function ObtenerIdAuthSupabase() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session != null) {
    const { user } = session;
    const idauth = user.id;
    return idauth;
  }
}

export async function EditarUsuario(p) {
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
