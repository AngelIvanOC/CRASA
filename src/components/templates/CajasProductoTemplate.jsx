import styled from "styled-components";
import { Title, TablaCajas, Buscador, Btnsave } from "../../index";
import { v } from "../../styles/variables";
import { useNavigate } from "react-router-dom";

export function CajasProductoTemplate({ cajas, showBackButton, backRoute }) {
  const navigate = useNavigate();

  return (
    <Container>
      <Title className="titulo" $colortexto="#9291A5">
        {showBackButton && (
          <span onClick={() => navigate(backRoute)} className="back-button">
            <v.felchaizquierdalarga />
          </span>
        )}
        <img src={v.emojiAlmacen} alt="" /> CAJAS
      </Title>
      <section className="main">
        <section className="header">
          <Buscador />
          <Btnsave
            bgcolor={v.colorPrincipal}
            titulo="Nuevo Producto"
            icono={<v.iconoagregar />}
            color="#fff"
          />
        </section>
        <TablaCajas data={cajas} />
      </section>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  //justify-content: center;
  padding: 0px 30px 0 0;

  .titulo {
    top: 0;
    left: 0;
    max-height: 5vh;
    .back-button {
      cursor: pointer;
    }
  }

  .main {
    max-height: 90vh;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.bgtotal};
    max-height: 100%;
    box-shadow: -4px 0px 4px -2px rgba(0, 0, 0, 0.25),
      2px 2px 4px 0px rgba(0, 0, 0, 0.25);
    overflow: hidden;

    .header {
      grid-area: area2;
      background-color: ${({ theme }) => theme.bgtotalFuerte};
      display: flex;
      justify-content: space-between;
      border-radius: 5px 5px 0 0;
      padding: 15px 20px;
      height: 10vh;
      box-sizing: border-box;
    }
  }
`;
