import { useQuery } from "@tanstack/react-query";
import { RacksTemplate, Spinner, useRacksStore } from "../index";

export function Racks() {
  const { mostrarRacks } = useRacksStore();

  const { isLoading, error } = useQuery({
    queryKey: ["mostrar racks"],
    queryFn: mostrarRacks,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Spinner />;
  if (error) return <span>Error al cargar racks</span>;

  return <RacksTemplate />;
}
