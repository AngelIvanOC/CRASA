import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "usuarios";

// Función para mostrar TODOS los usuarios (para la tabla)
export async function MostrarTodosUsuarios() {
  const { data } = await supabase
    .from(tabla)
    .select(
      `
      id,
      nombres,
      telefono,
      correo,
      direccion,
      estado,
      fecharegistro,
      roles:id_rol(id, nombre)
    `
    )
    .order("fecharegistro", { ascending: false });
  return data;
}

export async function MostrarUsuarios(p) {
  const { data } = await supabase
    .from(tabla)
    .select()
    .eq("id_auth", p.id_auth)
    .maybeSingle();
  return data;
}

export async function InsertarUsuario(p) {
  // Verificar si ya existe un usuario con ese correo
  const { data: usuarioExistente, error: errorVerificacion } = await supabase
    .from(tabla)
    .select("id")
    .eq("correo", p.correo)
    .maybeSingle();

  if (errorVerificacion) {
    Swal.fire({
      icon: "error",
      title: "Error al verificar",
      text: errorVerificacion.message,
    });
    return null;
  }

  if (usuarioExistente && p.correo !== "-") {
    Swal.fire({
      icon: "warning",
      title: "Usuario duplicado",
      text: "Ya existe un usuario con ese correo electronico.",
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

  Swal.fire({
    icon: "success",
    title: "¡Guardado!",
    text: "Usuario registrado correctamente.",
    timer: 2000,
    showConfirmButton: false,
  });

  return data?.id;
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

  Swal.fire({
    icon: "success",
    title: "¡Actualizado!",
    text: "Usuario actualizado correctamente.",
    timer: 2000,
    showConfirmButton: false,
  });

  return true;
}

export async function EliminarUsuario(p) {
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

// Función para obtener roles
export async function MostrarRoles() {
  const { data } = await supabase.from("roles").select("*").order("nombre");
  return data;
}

// Función para crear usuario completo (auth + perfil)
export async function CrearUsuarioCompleto(p) {
  try {
    // 1. Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: p.correo,
      password: p.password, // Nueva propiedad requerida
      options: {
        data: {
          created_by_admin: true,
          display_name: p.nombres,
        },
      },
    });

    if (authError) throw authError;

    // 2. Crear perfil en tabla usuarios
    if (authData.user) {
      const usuarioData = {
        ...p,
        id_auth: authData.user.id,
        fecharegistro: new Date().toISOString().split("T")[0],
        estado: p.estado || "ACTIVO",
      };
      delete usuarioData.password; // Remover password del perfil

      const { data, error } = await supabase
        .from(tabla)
        .insert(usuarioData)
        .select("id")
        .single();

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "¡Usuario creado!",
        text: "Usuario y perfil creados correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      return data?.id;
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "No se pudo crear el usuario",
    });
    return null;
  }
}
