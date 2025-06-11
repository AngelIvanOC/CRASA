import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductosVentaTemplate, Spinner, useVentasStore } from "../index";

export function ProductosVenta() {
  const { ventaId } = useParams();
  const { mostrarDetalleVenta } = useVentasStore();
  //const { mostrarProductosVenta } = useProductosVentaStore();

  // Cargar detalle de la venta específica
  const {
    data: detalleVenta,
    isLoading: isLoadingDetalle,
    error,
  } = useQuery({
    queryKey: ["detalle venta", ventaId],
    queryFn: () => mostrarDetalleVenta(ventaId),
    enabled: !!ventaId,
    refetchOnWindowFocus: false,
  });

  // Cargar todos los productos de venta (si es necesario)
  /*const { isLoading, error } = useQuery({
    queryKey: ["mostrar productos venta"],
    queryFn: mostrarProductosVenta,
    refetchOnWindowFocus: false,
  });*/

  if (isLoadingDetalle) return <Spinner />;
  if (error) return <span>Error...</span>;

  return (
    <ProductosVentaTemplate
      detalleVenta={detalleVenta}
      showBackButton={true}
      backRoute="/ventas"
    />
  );
}
