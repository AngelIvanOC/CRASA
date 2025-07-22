import { Routes, Route, data } from "react-router-dom";
import {
  Almacen,
  Configuracion,
  Ventas,
  Dashboard,
  Home,
  Racks,
  Login,
  ProtectedRoute,
  Spinner,
  UserAuth,
  useUsuariosStore,
  ProductosVenta,
  CajasProducto,
  Usuarios,
} from "../index";
import { useQuery } from "@tanstack/react-query";
export function MyRoutes() {
  const { user, loadingSession } = UserAuth();
  const { dataUsuarios, mostrarusuarios } = useUsuariosStore();

  //const { mostrarempresa, dataempresa } = useEmpresaStore();
  const { isLoading, error } = useQuery({
    queryKey: "mostrar usuarios",
    queryFn: mostrarusuarios,
    refetchOnWindowFocus: false,
  });
  /*const {} = useQuery({
    queryKey: ["mostrar empresa", dataUsuarios?.id],
    queryFn: () => mostrarempresa({ _id_usuario: dataUsuarios?.id }),
    enabled: !!dataUsuarios,
    refetchOnWindowFocus: false,
  });*/

  if (loadingSession) {
    return <Spinner />; // spinner global mientras Supabase decide
  }

  if (isLoading) {
    return <Spinner />;
  }
  if (error) {
    return <span>error..</span>;
  }
  return (
    <Routes>
      <Route element={<ProtectedRoute user={user} redirectTo="/login" />}>
        {/*<Route path="/configuracion" element={<Configuracion />} />
        <Route path="/configuracion/categorias" element={<Categorias />} />*/}
        <Route path="/" element={<Dashboard />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/almacen" element={<Almacen />} />
        <Route path="/almacen/:productoId/cajas" element={<CajasProducto />} />
        <Route path="/racks" element={<Racks />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/ventas/:ventaId/productos" element={<ProductosVenta />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
