import { useQuery } from "@tanstack/react-query";
import { VentasTemplate, Spinner, useVentasStore } from "../index";

export function Ventas() {
  const { mostrarVentas } = useVentasStore();

  const { isLoading, error } = useQuery({
    queryKey: ["mostrar ventas"],
    queryFn: mostrarVentas,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Spinner />;
  if (error) return <span>Error al cargar ventas</span>;

  return <VentasTemplate />;
}
