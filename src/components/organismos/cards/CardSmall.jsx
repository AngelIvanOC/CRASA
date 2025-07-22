import styled from "styled-components";
import { Icono } from "../../atomos/Icono";
import { v } from "../../../styles/variables";

export function CardSmall({
  funcion,
  titulo,
  data = [],
  bgcolor,
  icono,
  url,
  color,
  emoji,
  disabled,
  width,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  children,
  headerButton,
  headerJustify = "space-between", // 👈 NUEVO PROP para el botón del header
}) {
  return (
    <Container
      $width={width}
      disabled={disabled}
      $color={color}
      type="submit"
      $bgcolor={bgcolor}
      onClick={funcion}
      $headerJustify={headerJustify}
    >
      <section className="content">
        {/* Header con título y botón opcional */}
        <div className="header">
          <h2>{titulo}</h2>
          {headerButton && <div className="header-button">{headerButton}</div>}
        </div>

        {children ? (
          children // 👈 MOSTRAR EL CHILD CUSTOMIZADO
        ) : loading ? (
          <div className="loading">
            <p>Cargando...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="columns">
            <ul className="nombres">
              {data.map((item, index) => (
                <li key={index}>{item.nombre}</li>
              ))}
            </ul>
            <ul className="cantidad">
              {data.map((item, index) => (
                <li key={index}>{item.cantidad}</li>
              ))}
            </ul>
            <ul className="iconos">
              {data.map((item, index) => (
                <li key={index}>{emoji && <img src={emoji} />}</li>
              ))}
            </ul>
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

  /* 👈 NUEVO: Estilos para el header */
  .header {
    display: flex;
    justify-content: ${({ $headerJustify }) =>
      $headerJustify || "space-between"};
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

  /* 👈 MANTENER h2 para compatibilidad cuando no hay headerButton */
  h2 {
    margin: 0 0 10px 0;
    padding: 0;
    font-size: 20px;
    font-weight: 600;
    img {
      width: 20px;
    }
  }

  .columns {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;

    ul {
      list-style: none;
      font-size: 12px;
      margin: 0;
      padding: 0;
      padding: 0 15px;

      li {
        padding-bottom: 3px;
        font-size: 12px;
        img {
          height: 12px;
          padding: 0;
        }
      }
    }

    .cantidad {
      color: #9291a5;
      font-weight: 500;
      text-align: center;
    }

    .nombres {
      font-weight: bold;
    }

    .iconos {
      text-align: center;
      font-size: 14px;
    }
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
