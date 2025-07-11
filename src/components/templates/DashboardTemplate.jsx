import styled from "styled-components";
import { useEffect } from "react";
import { CardSmall } from "../organismos/cards/CardSmall";
import { CardPedidosFecha } from "../organismos/cards/CardPedidosFecha";
import { useDashboardStore } from "../../store/DashboardStore";
import { CardEntradas } from "../organismos/cards/CardEntradas";
import { v } from "../../styles/variables";
import { Device } from "../../styles/breakpoints";

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
                Compras <img src={v.compras} />
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
          <CardSmall titulo="Próximos a Caducar" loading={loadingCaducar}>
            {dataCaducar.length > 0 ? (
              <ul style={{ padding: "0", listStyle: "none", margin: 0 }}>
                {dataCaducar.map((item, index) => {
                  let color = "#d1f7c4"; // verde
                  if (item.dias <= 3) color = "#fddcdc"; // rojo
                  else if (item.dias <= 6) color = "#fff2cc"; // amarillo

                  return (
                    <li key={index}>
                      <div style={{ fontWeight: "bold", fontSize: 12 }}>
                        {item.producto}
                      </div>
                      <div style={{ color: "#999", fontSize: 11 }}>
                        {item.marca}
                      </div>
                      <div
                        style={{
                          backgroundColor: color,
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {item.dias} {item.dias === 1 ? "día" : "días"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty">
                <p>No hay productos por caducar</p>
              </div>
            )}
          </CardSmall>
          <CardSmall titulo="Pedidos Activos" loading={loadingPedidosActivos}>
            {dataPedidosActivos.length > 0 ? (
              <ul style={{ padding: "0 10px", listStyle: "none", margin: 0 }}>
                {dataPedidosActivos.map((item, index) => {
                  let color = "#fff3b0"; // default: En proceso
                  if (item.estado.toLowerCase() === "recibido")
                    color = "#d1f7c4";

                  return (
                    <li
                      key={index}
                      style={{
                        padding: "5px 8px",
                        marginBottom: 6,
                        borderRadius: 8,
                        backgroundColor: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ fontWeight: "bold", fontSize: 12 }}>
                        {item.codigo}
                      </div>
                      <div style={{ color: "#999", fontSize: 11 }}>
                        {item.marca}
                      </div>
                      <div
                        style={{
                          backgroundColor: color,
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {item.estado === "recibido" && item.fecha
                          ? `Recibido ${item.fecha}`
                          : item.estado.charAt(0).toUpperCase() +
                            item.estado.slice(1)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty">
                <p>No hay pedidos activos</p>
              </div>
            )}
          </CardSmall>
          <div className="span-2">
            <CardSmall
              titulo="Movimientos Recientes"
              loading={loadingMovimientos}
            >
              {dataMovimientos.length > 0 ? (
                <div className="movimientos-table">
                  <div className="table-header">
                    <span># Codigo</span>
                    <span>Cantidad</span>
                    <span>Almacén</span>
                    <span>Día</span>
                    <span>Tipo</span>
                  </div>
                  {dataMovimientos.map((mov, index) => (
                    <div key={index} className="table-row">
                      <span className="pedido">{mov.pedido}</span>
                      <span className="cantidad">{mov.cantidad}</span>
                      <span className="almacen">{mov.marca}</span>
                      <span className="dia">{mov.dia}</span>
                      <span className={`tipo ${mov.tipo}`}>
                        {mov.tipo === "entrada" ? "📦" : "📤"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <p>No hay movimientos recientes</p>
                </div>
              )}
            </CardSmall>
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

    .area1 {
      grid-area: area1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }

    .area2 {
      grid-area: area2;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
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
`;
