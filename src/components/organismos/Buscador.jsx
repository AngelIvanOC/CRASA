import styled from "styled-components";
import { v } from "../../styles/variables";

export function Buscador({ setBuscador }) {
  function buscar(e) {
    setBuscador(e.target.value);
  }
  return (
    <Container>
      <section className="content">
        <v.iconobuscar className="icono" />
        <input type="text" placeholder="Buscar" onChange={buscar} />
      </section>
    </Container>
  );
}

const Container = styled.div`
  width: 25%;
  border-radius: 10px;
  align-items: center;
  display: flex;
  color: ${(props) => props.theme.textsecundario};
  border: 2px solid ${({ theme }) => theme.color2};
  background-color: ${(props) => props.theme.bgtotal};

  .content {
    gap: 10px;
    display: flex;
    align-items: center;
    width: 100%;
    padding-left: 10px;
    .icono {
      font-size: 18px;
      color: ${(props) => props.theme.textsecundario};
    }
    input {
      font-size: 18px;
      width: 100%;
      outline: none;
      background: none;
      border: 0;
      color: ${({ theme }) => theme.textsecundario};
      &::placeholder {
        color: ${({ theme }) => theme.textsecundario};
      }
    }
  }
`;
