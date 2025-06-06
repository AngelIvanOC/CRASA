import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductosCompraTemplate, Spinner, useComprasStore } from "../index";

export function ProductosCompra() {
  const { compraId } = useParams();
  const { mostrarDetalleCompra } = useComprasStore();
  //const { mostrarProductosCompra } = useProductosCompraStore();

  // Cargar detalle de la compra específica
  const {
    data: detalleCompra,
    isLoading: isLoadingDetalle,
    error,
  } = useQuery({
    queryKey: ["detalle compra", compraId],
    queryFn: () => mostrarDetalleCompra(compraId),
    enabled: !!compraId,
    refetchOnWindowFocus: false,
  });

  // Cargar todos los productos de compra (si es necesario)
  /*const { isLoading, error } = useQuery({
    queryKey: ["mostrar productos compra"],
    queryFn: mostrarProductosCompra,
    refetchOnWindowFocus: false,
  });*/

  if (isLoadingDetalle) return <Spinner />;
  if (error) return <span>Error...</span>;

  return (
    <ProductosCompraTemplate
      detalleCompra={detalleCompra}
      showBackButton={true}
      backRoute="/compras"
    />
  );
}
