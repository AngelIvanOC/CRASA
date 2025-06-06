import styled from "styled-components";
import { Icono } from "../../atomos/Icono";
import { v } from "../../../styles/variables";

export function CardLong({
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
        <ul>
          <li className="nombre">Crasa</li>
          <li>35 📦</li>
          <li>1,675 🧃</li>
        </ul>
        <ul>
          <li className="nombre">Crasa</li>
          <li>35 📦</li>
          <li>1,675 🧃</li>
        </ul>
        <ul>
          <li className="nombre">Crasa</li>
          <li>35 📦</li>
          <li>1,675 🧃</li>
        </ul>
        <ul>
          <li className="nombre">Crasa</li>
          <li>35 📦</li>
          <li>1,675 🧃</li>
        </ul>
      </section>
    </Container>
  );
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.bgtotal};
  border-radius: 10px;
  box-shadow: -4px 0px 4px -2px rgba(0, 0, 0, 0.25),
    2px 2px 4px 0px rgba(0, 0, 0, 0.25);
  height: 100%;
  max-width: 100%;
  .content {
    display: flex;
    justify-content: space-around;
    ul {
      list-style: none;
      display: flex;
    }

    .nombre {
      font-weight: bold;
    }
  }
`;
