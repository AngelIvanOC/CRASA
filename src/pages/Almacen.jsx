import { useQuery } from "@tanstack/react-query";
import { AlmacenTemplate, Spinner, useProductosStore } from "../index";

export function Almacen() {
  const { mostrarProductos } = useProductosStore();

  const { isLoading, error } = useQuery({
    queryKey: ["mostrar productos"],
    queryFn: mostrarProductos,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <span>Error...</span>;
  }

  return <AlmacenTemplate />;
}
