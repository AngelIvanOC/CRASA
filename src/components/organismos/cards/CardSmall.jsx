import styled from "styled-components";
import { Icono } from "../../atomos/Icono";
import { v } from "../../../styles/variables";

export function CardSmall({
  funcion,
  titulo,
  bgcolor,
  icono,
  url,
  color,
  disabled,
  width,
}) {
  return (
    <Container
      $width={width}
      disabled={disabled}
      $color={color}
      type="submit"
      $bgcolor={bgcolor}
      onClick={funcion}
    >
      <section className="content">
        <h2>{titulo}</h2>
        <div className="columns">
          <ul className="nombres">
            <li>Crasa</li>
            <li>Jumex</li>
            <li>La Costeña</li>
            <li>Con</li>
          </ul>
          <ul className="cantidad">
            <li>750</li>
            <li>750</li>
            <li>750</li>
            <li>750</li>
          </ul>
          <ul>
            <li>📦</li>
            <li>📦</li>
            <li>📦</li>
            <li>📦</li>
          </ul>
        </div>
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
  h2 {
    margin: 0;
    padding: 0;
    font-size: 15px;
  }

  .columns {
    display: flex;
    justify-content: space-around;
    align-items: center;

    ul {
      list-style: none;
      font-size: 12px;
      margin: 0;
      padding: 0;
      li {
        padding-bottom: 5px;
      }
    }

    .cantidad {
      color: #9291a5;
      font-weight: 500;
    }

    .nombres {
      font-weight: bold;
    }
  }
`;
