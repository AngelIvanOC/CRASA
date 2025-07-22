import { useQuery } from "@tanstack/react-query";
import { UsuariosTemplate, Spinner, useUsuariosStore } from "../index";

export function Usuarios() {
  const { mostrarTodosUsuarios, dataTodosUsuarios } = useUsuariosStore();

  const { isLoading, error } = useQuery({
    queryKey: ["mostrar todos usuarios"],
    queryFn: mostrarTodosUsuarios,
    // Usar datos iniciales si ya existen
    initialData: dataTodosUsuarios?.length > 0 ? dataTodosUsuarios : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false, // No refetch si ya hay datos
  });

  if (isLoading && !dataTodosUsuarios?.length) return <Spinner />;
  if (error) return <span>Error al cargar usuarios</span>;

  return <UsuariosTemplate />;
}
