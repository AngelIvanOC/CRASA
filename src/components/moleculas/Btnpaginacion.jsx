import styled from "styled-components";
import { Icono } from "../../index";
import { Device } from "../../styles/breakpoints";

export function Btnpaginacion({
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
        <Icono $color={color} className="icono">
          {icono}
        </Icono>
      </section>
    </Container>
  );
}
const Container = styled.button`
  display: flex;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.bordeBotonPag};
  cursor: pointer;
  transition: 0.2s;
  transition-timing-function: linear;
  color: ${({ theme }) => theme.bordeBotonPag};
  background-color: ${({ theme }) => theme.bgtotal};
  align-items: center;
  justify-content: center;
  .content {
    display: flex;
    gap: 12px;
    .icono {
      padding: 4px 1px;
      font-weight: 700;
      font-size: 15px;
    }
  }
  &:active {
    transform: translate(0, 0);
    border-bottom: 2px solid rgba(50, 50, 50, 0.2);
  }
  &[disabled] {
    background-color: transparent;
    cursor: no-drop;
    box-shadow: none;
  }
`;
