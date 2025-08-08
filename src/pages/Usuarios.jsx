import { useQuery } from "@tanstack/react-query";
import { UsuariosTemplate, Spinner, useUsuariosStore } from "../index";

export function Usuarios() {
  const { mostrarTodosUsuarios, dataTodosUsuarios } = useUsuariosStore();

  const { isLoading, error } = useQuery({
    queryKey: ["mostrar todos usuarios"],
    queryFn: mostrarTodosUsuarios,
    initialData: dataTodosUsuarios?.length > 0 ? dataTodosUsuarios : undefined,
    staleTime: 5 * 60 * 1000, 
    cacheTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
    refetchOnMount: false, 
  });

  if (isLoading && !dataTodosUsuarios?.length) return <Spinner />;
  if (error) return <span>Error al cargar usuarios</span>;

  return <UsuariosTemplate />;
}
