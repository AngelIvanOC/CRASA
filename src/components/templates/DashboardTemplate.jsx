import styled from "styled-components";
import { useEffect } from "react";
import { CardSmall } from "../organismos/cards/CardSmall";
import { CardPedidosFecha } from "../organismos/cards/CardPedidosFecha";
import { useDashboardStore } from "../../store/DashboardStore";
import { CardEntradas } from "../organismos/cards/CardEntradas";
import { CardCaducar } from "../organismos/cards/CardCaducar";
import { v } from "../../styles/variables";
import { Device } from "../../styles/breakpoints";
import { CardPedidosActivos } from "../organismos/cards/CardPediosActivos";
import { CardMovimientos } from "../organismos/cards/CardMovimientos";

export function DashboardTemplate() {
  // Estados del dashboard store
  const {
    dataVentas,
    dataRacks,
    dataCompras,
    dataProductos,
    dataCaducar,
    dataPedidosActivos,
    dataMovimientos,
    dataPedidosFecha,
    dataEntradas,
    loadingVentas,
    loadingRacks,
    loadingCompras,
    loadingProductos,
    loadingCaducar,
    loadingPedidosActivos,
    loadingMovimientos,
    loadingPedidosFecha,
    loadingEntradas,
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
            titulo={
              <span>
                Ventas <img src={v.ventas} />
              </span>
            }
            data={dataVentas}
            loading={loadingVentas}
            emptyMessage="No hay ventas registradas"
            emoji={v.emojiVentas}
          />
          <CardSmall
            titulo={
              <span>
                Racks <img src={v.racks} />
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
                Cajas <img src={v.compras} />
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
          <CardCaducar
            titulo="Próximos a Caducar"
            data={dataCaducar}
            loading={loadingCaducar}
            emptyMessage="No hay productos por caducar"
          />
          <CardPedidosActivos
            titulo="Pedidos Activos"
            data={dataPedidosActivos}
            loading={loadingPedidosActivos}
            emptyMessage="No hay pedidos activos"
          />
          <div className="span-2">
            <CardMovimientos
              data={dataMovimientos}
              loading={loadingMovimientos}
            />
          </div>
        </section>

        <section className="main">
          <div className="span-1">
            <CardPedidosFecha
              data={dataPedidosFecha}
              loading={loadingPedidosFecha}
            />
          </div>
          <CardEntradas data={dataEntradas} loading={loadingEntradas} />
        </section>
      </section>
    </Container>
  );
}

const Container = styled.div`
  .contenido {
    display: flex;
    flex-direction: column;
  }

  .area1,
  .area2,
  .main {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .main .span-1 {
    grid-column: auto;
  }

  .area2 .span-2 {
    grid-column: auto;
  }

  @media ${Device.laptop} {
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
      gap: 15px;
      box-sizing: border-box;

      > * {
        min-height: 0;
        max-height: 100%;
      }

      .area1 {
        grid-area: area1;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        > * {
          min-height: 0;
          max-height: 100%;
        }
      }

      .area2 {
        grid-area: area2;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;

        > *:not(:last-child) {
          min-width: 0;
          max-width: 100%;
          max-height: 0;
          max-height: 100%;
          overflow-y: hidden;
        }

        .span-2 {
          grid-column: span 2;

          .movimientos-table {
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 11px;

            .table-header {
              display: grid;
              grid-template-columns: 1.5fr 1fr 1fr 1fr 0.5fr;
              gap: 8px;
              padding: 0 12px;
              border-radius: 6px;
              font-weight: bold;
              color: #9291a5;
              font-size: 15px;
              text-transform: uppercase;
            }

            .table-row {
              display: grid;
              grid-template-columns: 1.5fr 1fr 1fr 1fr 0.5fr;
              gap: 8px;
              padding: 0 12px;
              align-items: center;
              color: #000;
              font-size: 14px;
              font-weight: bold;

              .tipo {
                text-align: center;
                font-size: 14px;

                &.entrada {
                  filter: hue-rotate(200deg);
                }

                &.venta {
                  filter: hue-rotate(0deg);
                }
              }
            }
          }
        }
      }

      .main {
        grid-area: main;
        gap: 15px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);

        .span-1 {
          grid-column: span 3;
        }
      }
    }
  }
`;
