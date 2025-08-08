import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CajasProductoTemplate, Spinner } from "../index";
import { useCajasStore } from "../store/useCajasStore";

export function CajasProducto() {
  const { productoId } = useParams();
  const { obtenerCajasPorProducto, setDataCajas, dataCajas } = useCajasStore();

  const queryClient = useQueryClient();

  const { isLoading, error } = useQuery({
    queryKey: ["cajas producto", productoId],
    queryFn: () => obtenerCajasPorProducto(productoId),
    enabled: !!productoId,
    refetchOnWindowFocus: false,
    onSuccess: (data) => setDataCajas(data),
  });

  const refreshCajas = () => {
    queryClient.invalidateQueries(["cajas producto", productoId]);
  };

  if (isLoading) return <Spinner />;
  if (error) return <span>Error al cargar cajas</span>;

  return (
    <CajasProductoTemplate
      cajas={dataCajas}
      showBackButton={true}
      backRoute="/almacen"
      refreshCajas={refreshCajas}
    />
  );
}
