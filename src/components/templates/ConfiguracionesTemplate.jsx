import styled from "styled-components";
import { CardSmall } from "../organismos/cards/CardSmall";
import { CardCuenta } from "../organismos/cards/configuracion/CardCuenta";
import { CardPersonal } from "../organismos/cards/configuracion/CardPersonal";
import { CardMarcas } from "../organismos/cards/configuracion/CardMarcas";
import { CardNotificaciones } from "../organismos/cards/configuracion/CardNotificaciones";

export function ConfiguracionesTemplate() {
  return (
    <Container>
      <section className="contenido">
        <div className="grid-cards">
          <CardPersonal />
          <CardMarcas />
          <CardCuenta />
          <CardNotificaciones />
        </div>
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
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .grid-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 25px;
    width: 100%;
    height: 100%;
  }
`;
