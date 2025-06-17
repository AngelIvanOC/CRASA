import styled from "styled-components";
import { useEffect } from "react";
import { useAuthStore } from "../../store/AuthStore";
import { UserAuth } from "../../context/AuthContext";
import { CardSmall } from "../organismos/cards/CardSmall";
import { useDashboardStore } from "../../store/DashboardStore";
import { v } from "../../styles/variables";
import { Device } from "../../styles/breakpoints";

export function DashboardTemplate() {
  const { cerrarSesion } = useAuthStore();
  const { user } = UserAuth();

  // Estados del dashboard store
  const {
    dataVentas,
    dataRacks,
    dataCompras,
    dataProductos,
    loadingVentas,
    loadingRacks,
    loadingCompras,
    loadingProductos,
    loading,
    cargarDatosDashboard,
  } = useDashboardStore();

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatosDashboard();
  }, [cargarDatosDashboard]);

  return (
    <Container>
      <section className="contenido">
        <section className="area1">
          <CardSmall
            titulo="Ventas"
            data={dataVentas}
            loading={loadingVentas}
            emptyMessage="No hay ventas registradas"
            emoji={v.emojiAlmacen}
          />
          <CardSmall
            titulo={
              <span>
                Racks <img src={v.emojiRacks} />
              </span>
            }
            data={dataRacks}
            loading={loadingRacks}
            emptyMessage="No hay racks registrados"
            emoji={v.emojiRacks}
          />
          <CardSmall
            titulo={
              <span>
                Compras <img src={v.emojiRacks} />
              </span>
            }
            data={dataCompras}
            loading={loadingCompras}
            emptyMessage="No hay compras registradas"
          />
          <CardSmall
            titulo="Productos"
            data={dataProductos}
            loading={loadingProductos}
            emptyMessage="No hay productos registrados"
          />
        </section>

        <section className="area2">
          <CardSmall titulo="Próximos" />
          <CardSmall titulo="Pedidos" />
          <div className="span-2">
            <CardSmall titulo="Movimientos" />
          </div>
        </section>

        <section className="main">
          <div className="span-1">
            <CardSmall titulo="Estadísticas" />
          </div>
          <CardSmall titulo="Alertas" />
        </section>
      </section>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0px 30px 0 0;
  justify-content: center;

  .contenido {
    height: 90vh;
    display: grid;
    grid-template:
      "area1" 2fr
      "area2" 3.5fr
      "main" 3.5fr;
    gap: 25px;
    box-sizing: border-box;

    .area1 {
      grid-area: area1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 25px;
    }

    .area2 {
      grid-area: area2;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 25px;
      .span-2 {
        grid-column: span 2;
      }
    }

    .main {
      grid-area: main;
      gap: 25px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      .span-1 {
        grid-column: span 3;
      }
    }
  }
`;
