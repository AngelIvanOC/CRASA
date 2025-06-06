import Swal from "sweetalert2";
import { supabase } from "../index";
const tabla = "facturas";

export async function InsertarCategorias(p, file) {
  const { error, data } = await supabase.rpc("insertarcategorias", p);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return;
  }
  const img = file.size;
  if (img != undefined) {
    const nuevo_id = data;
    const urlImagen = await subirImagen(nuevo_id, file);
    const piconoeditar = {
      icono: urlImagen.publicUrl,
      id: nuevo_id,
    };
    await EditarIconoCategorias(piconoeditar);
  }
}

export async function subirFacturaPDF(compraId, archivo) {
  const nombreArchivo = `facturas/${compraId}-${archivo.name}`;
  const { data, error } = await supabase.storage
    .from("documentos")
    .upload(nombreArchivo, archivo, {
      cacheControl: "0",
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = await supabase.storage
    .from("documentos")
    .getPublicUrl(nombreArchivo);

  return { nombre_archivo: archivo.name, url: urlData.publicUrl };
}

async function EditarIconoCategorias(p) {
  const { error } = await supabase.from("categorias").update(p).eq("id", p.id);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return;
  }
}

export async function MostrarCategorias(p) {
  const { data } = await supabase
    .from(tabla)
    .select()
    .eq("id_empresa", p.id_empresa)
    .order("id", { ascending: false });
  return data;
}

export async function BuscarCategorias(p) {
  const { data } = supabase
    .from(tabla)
    .select()
    .eq("id_empresa", p.id_empresa)
    .ilike("nombre", "%" + p.descripcion + "%");
  return data;
}

export async function EliminarCategorias(p) {
  const { error } = await supabase.from(tabla).delete().eq("id", p.id);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return;
  }
  if (p.icono != "-") {
    const ruta = "categorias/" + p.id;
    await supabase.storage.from("imagenes").remove([ruta]);
  }
}

export async function EditarCategorias(p, fileold, filenew) {
  const { error } = await supabase.rpc("editarcategorias", p);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return;
  }
  if (filenew != "-" && filenew != undefined) {
    if (fileold != "-") {
      await EditarIconoStorage(p._id, filenew);
    } else {
      const dataImagen = await subirImagen(p._id, filenew);
      const piconoeditar = {
        icono: dataImagen.publicUrl,
        id: p._id,
      };
      await EditarIconoCategorias(piconoeditar);
    }
  }
}

export async function EditarIconoStorage(id, file) {
  const ruta = "categorias/" + id;
  await supabase.storage
    .from("imagenes")
    .update(ruta, file, { cacheControl: "0", upsert: true });
}
