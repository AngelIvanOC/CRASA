import styled from "styled-components";
import { Btnsave, Title, Buscador, TablaProductosVenta } from "../../index";
import { v } from "../../styles/variables";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AsignarProductos } from "../organismos/formularios/AsignarProductos";

export function ProductosVentaTemplate({
  detalleVenta,
  showBackButton = false,
  backRoute = "/",
  ventaId,
}) {
  const navigate = useNavigate();
  const [openRegistro, SetopenRegistro] = useState(false);
  //const { detalleVenta } = useVentasStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
  }

  return (
    <Container>
      {openRegistro && (
        <AsignarProductos
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
          marcaId={
            detalleVenta?.[0]?.marca_id ||
            detalleVenta?.[0]?.productos?.marca_id
          }
          ventaId={ventaId}
        />
      )}
      <Title className="titulo" $colortexto="#9291A5">
        {showBackButton && (
          <span onClick={() => navigate(backRoute)} className="back-button">
            <v.felchaizquierdalarga />{" "}
          </span>
        )}
        <img src={v.emojiAlmacen} alt="" /> PRODUCTOS
      </Title>{" "}
      <section className="main">
        <section className="header">
          <Buscador />
          <Btnsave
            funcion={nuevoRegistro}
            bgcolor={v.colorBotones}
            titulo="Asignar Producto"
            icono={<v.iconoagregar />}
            color="#fff"
          />
        </section>
        <TablaProductosVenta
          data={detalleVenta}
          SetopenRegistro={SetopenRegistro}
          setdataSelect={setdataSelect}
          setAccion={setAccion}
        />
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
