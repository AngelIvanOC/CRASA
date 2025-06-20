{
  /*import { useQuery } from "@tanstack/react-query";
import {
  CategoriasTemplate,
  Spinner,
  useCategoriasStore,
  useEmpresaStore,
} from "../index";
export function Categorias() {
  const { mostrarCategorias } = useCategoriasStore();
  const { dataempresa } = useEmpresaStore();
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar categorias", dataempresa?.id],
    queryFn: () => mostrarCategorias({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });
  if (isLoading) {
    return <Spinner />;
  }
  if (error) {
    return <span>Error...</span>;
  }
  return <CategoriasTemplate />;
}
*/
}
