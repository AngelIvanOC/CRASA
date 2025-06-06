import { useQuery } from "@tanstack/react-query";
import { ComprasTemplate, Spinner, useComprasStore } from "../index";

export function Compras() {
  const { mostrarCompras } = useComprasStore();

  const { isLoading, error } = useQuery({
    queryKey: ["mostrar compras"],
    queryFn: mostrarCompras,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Spinner />;
  if (error) return <span>Error al cargar compras</span>;

  return <ComprasTemplate />;
}
