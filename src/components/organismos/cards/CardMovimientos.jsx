import styled from "styled-components";
import { CardSmall } from "./CardSmall";

export function CardMovimientos({ data, loading }) {
  return (
    <CardSmall
      titulo="Movimientos Recientes"
      loading={loading}
      emptyMessage="No hay movimientos recientes"
      className="span-2"
      headerJustify="center"
    >
      {data.length > 0 ? (
        <div className="movimientos-table">
          <div className="table-header">
            <span># Codigo</span>
            <span>Cantidad</span>
            <span>Almacén</span>
            <span>Día</span>
            <span>Tipo</span>
          </div>
          {data.map((mov, index) => (
            <div key={index} className="table-row">
              <span className="pedido">{mov.pedido}</span>
              <span className="cantidad">{mov.cantidad}</span>
              <span className="almacen">{mov.marca}</span>
              <span className="dia">{mov.dia}</span>
              <span className={`tipo ${mov.tipo}`}>
                {mov.tipo === "entrada" ? "entrada" : "salida"}
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
  );
}

const Container = styled.div`
  .movimientos-table {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 11px;
    height: 100%;
    overflow-y: auto;

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
      position: sticky;
      top: 0;
      background-color: ${({ theme }) => theme.bgtotal};
      z-index: 1;
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

  @media (max-width: 768px) {
    .movimientos-table {
      .table-header,
      .table-row {
        grid-template-columns: 1.5fr 1fr 1fr 0.8fr 0.5fr;
        font-size: 12px;
      }
    }
  }
`;
