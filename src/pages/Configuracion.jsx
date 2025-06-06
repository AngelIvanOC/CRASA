import { useQuery } from "@tanstack/react-query";
import { ConfiguracionesTemplate, Spinner, useModulosStore } from "../index";
export function Configuracion() {
  const { mostrarModulos } = useModulosStore();
  const { isLoading, error } = useQuery({
    queryKey: "mostrar modulos",
    queryFn: mostrarModulos,
  });
  if (isLoading) {
    return <Spinner />;
  }
  if (error) {
    return <span>error....</span>;
  }
  return <ConfiguracionesTemplate />;
}
