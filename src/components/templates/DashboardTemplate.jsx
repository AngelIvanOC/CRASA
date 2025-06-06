import styled from "styled-components";
import { useAuthStore } from "../../store/AuthStore";
import { UserAuth } from "../../context/AuthContext";
import { CardSmall } from "../organismos/cards/CardSmall";
import { v } from "../../styles/variables";

export function DashboardTemplate() {
  const { cerrarSesion } = useAuthStore();
  const { user } = UserAuth();
  return (
    <Container>
      <section className="contenido">
        <section className="area1">
          <CardSmall titulo="Compras" />
          <CardSmall titulo="Ventas" />
          <CardSmall titulo="Ventas" />
          <CardSmall titulo="Ventas" />
        </section>

        <section className="area2">
          <CardSmall titulo="Proximos" />
          <CardSmall titulo="Pedidos" />
          <div className="span-2">
            <CardSmall titulo="Movimientos" />
          </div>
        </section>

        <section className="main">
          <div className="span-1">
            <CardSmall titulo="Proximos" />
          </div>
          <CardSmall titulo="Pedidos" />
        </section>
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
  justify-content: center;

  .contenido {
    height: 90vh;
    //justify-content: center;
    display: grid;
    grid-template:
      "area1" 2fr
      "area2" 3.5fr
      "main" 3.5fr;
    gap: 25px;
    box-sizing: border-box;

    .area1 {
      grid-area: area1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 25px;
    }

    .area2 {
      grid-area: area2;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 25px;
      .span-2 {
        grid-column: span 2;
      }
    }

    .main {
      grid-area: main;
      gap: 25px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      .span-1 {
        grid-column: span 3;
      }
    }
  }
`;
