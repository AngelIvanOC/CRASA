import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CajasProductoTemplate, Spinner } from "../index";
import { useCajasStore } from "../store/useCajasStore";

export function CajasProducto() {
  const { productoId } = useParams();
  const { obtenerCajasPorProducto, setDataCajas } = useCajasStore(); // <-- AQUI

  const {
    data: cajas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cajas producto", productoId],
    queryFn: () => obtenerCajasPorProducto(productoId),
    enabled: !!productoId,
    refetchOnWindowFocus: false,
    onSuccess: (data) => setDataCajas(data), // ahora sí existe
  });

  if (isLoading) return <Spinner />;
  if (error) return <span>Error al cargar cajas</span>;

  return (
    <CajasProductoTemplate
      cajas={cajas}
      showBackButton={true}
      backRoute="/almacen"
    />
  );
}

