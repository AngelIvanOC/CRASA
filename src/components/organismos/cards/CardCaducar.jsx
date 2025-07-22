import styled from "styled-components";

export function CardCaducar({
  titulo = "Próximos a Caducar",
  data = [],
  loading = false,
  emptyMessage = "No hay productos por caducar",
  headerButton,
}) {
  return (
    <Container>
      <section className="content">
        {/* Header con título y botón opcional */}
        <div className="header">
          <h2>{titulo}</h2>
          {headerButton && <div className="header-button">{headerButton}</div>}
        </div>

        {loading ? (
          <div className="loading">
            <p>Cargando...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="productos-list">
            {data.map((item, index) => {
              let color = "#d1f7c4"; // verde
              if (item.dias <= 3) color = "#fddcdc"; // rojo
              else if (item.dias <= 6) color = "#fff2cc"; // amarillo

              return (
                <div key={index} className="producto-item">
                  <div className="producto-info">
                    <div className="producto-nombre">{item.producto}</div>
                    <div className="producto-marca">{item.marca}</div>
                  </div>
                  <div
                    className="dias-badge"
                    style={{ backgroundColor: color }}
                  >
                    {item.dias} {item.dias === 1 ? "día" : "días"}
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
  box-sizing: border-box;

  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px 0;
  }

  /* Header con título y botón opcional */
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

  /* Lista de productos */
  .productos-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow-y: scroll;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
    ::-webkit-scrollbar {
      display: none; /* Chrome, Safari */
    }
    flex-grow: 1;
  }

  .producto-item {
    min-width: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid rgba(146, 145, 165, 0.1);

    > * {
      min-width: 0;
      overflow: hidden;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .producto-info {
    flex: 1;
    min-width: 0;
    max-width: 80%;

    .producto-nombre {
      font-weight: 500;
      font-size: 12px;
      color: #000;
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .producto-marca {
      color: #9291a5;
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .dias-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
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
