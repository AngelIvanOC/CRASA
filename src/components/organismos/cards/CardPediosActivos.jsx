import styled from "styled-components";

export function CardPedidosActivos({
  titulo = "Pedidos Activos",
  data = [],
  loading = false,
  emptyMessage = "No hay pedidos activos",
  headerButton,
}) {
  return (
    <Container>
      <section className="content">
        <div className="header">
          <h2>{titulo}</h2>
          {headerButton && <div className="header-button">{headerButton}</div>}
        </div>

        {loading ? (
          <div className="loading">
            <p>Cargando...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="pedidos-list">
            {data.map((item, index) => {
              let color = "#fddcdc";
              if (item.estado.toLowerCase() === "en_progreso")
                color = "#fff3b0";

              return (
                <div key={index} className="pedido-item">
                  <div className="pedido-info">
                    <div className="pedido-codigo">{item.codigo}</div>
                    <div className="pedido-marca">{item.marca}</div>
                  </div>
                  <div
                    className="estado-badge"
                    style={{ backgroundColor: color }}
                  >
                    {item.estado === "recibido" && item.fecha
                      ? `Recibido ${item.fecha}`
                      : item.estado.charAt(0).toUpperCase() +
                        item.estado.slice(1)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty">
            <p>{emptyMessage}</p>
          </div>
        )}
      </section>
    </Container>
  );
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.bgtotal};
  border-radius: 10px;
  height: 100%;
  box-shadow: -4px 0px 4px -2px rgba(0, 0, 0, 0.25),
    2px 2px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 0 10px;

  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px 0;
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;

    h2 {
      display: inline-block;
      margin: 0;
      padding: 0;
      font-size: 18px;
      font-weight: 600;

      img {
        width: 20px;
      }
    }

    .header-button {
      button {
        .content {
          flex-direction: row;
          padding-top: 0;
          padding-bottom: 0;
        }
      }
    }
  }

  .pedidos-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow-y: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
      display: none;
    }
    flex-grow: 1;
  }

  .pedido-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid rgba(146, 145, 165, 0.1);

    &:last-child {
      border-bottom: none;
    }
  }

  .pedido-info {
    flex: 1;
    min-width: 0;

    .pedido-codigo {
      font-weight: 500;
      font-size: 12px;
      color: #000;
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pedido-marca {
      color: #9291a5;
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .estado-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    margin-left: 8px;
    color: #333;
  }

  .loading,
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;

    p {
      color: #9291a5;
      font-size: 12px;
      margin: 0;
    }
  }

  .loading p {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;
