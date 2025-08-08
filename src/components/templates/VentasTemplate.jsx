import styled from "styled-components";
import {
  Title,
  useVentasStore,
  TablaVentas,
  Btnsave,
  Buscador,
  RegistrarVenta,
  useUsuariosStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useState } from "react";
import { Device } from "../../index";
import { RegistrarDevolucion } from "../organismos/formularios/RegistrarDevolucion";

export function VentasTemplate() {
  const [modalOpen, setModalOpen] = useState(false);
  const [openRegistro, SetopenRegistro] = useState(false);
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const { dataVentas } = useVentasStore();
  const [openDevolucion, setOpenDevolucion] = useState(false);

  const { dataUsuarios } = useUsuariosStore();
  const esEncargado = dataUsuarios?.id_rol === 3;

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
  }

  function nuevaDevolucion() {
    setOpenDevolucion(!openDevolucion);
  }

  return (
    <Container>
      {openRegistro && (
        <RegistrarVenta
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}

      {openDevolucion && (
        <RegistrarDevolucion
          onClose={() => setOpenDevolucion(!openDevolucion)}
        />
      )}

      <Title className="titulo" $colortexto="#9291A5">
        <img src={v.almacen} alt="" /> VENTAS
      </Title>

      <section className="main">
        <section className="header">
          <Buscador />

          {!esEncargado && (
            <Btnsave
              funcion={nuevaDevolucion}
              bgcolor={v.colorBotones}
              titulo="Registrar Devolución"
              icono={<v.iconoagregar />}
              color="#fff"
            />
          )}

          <Btnsave
            funcion={nuevoRegistro}
            bgcolor={v.colorBotones}
            titulo="Nueva Venta"
            icono={<v.iconoagregar />}
            color="#fff"
          />
        </section>

        <TablaVentas
          data={dataVentas}
          onVerDetalle={() => setModalOpen(true)}
          SetopenRegistro={SetopenRegistro}
          setdataSelect={setdataSelect}
          setAccion={setAccion}
        />
      </section>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  height: calc(100vh - 70px);
  box-sizing: border-box;

  .titulo {
    top: 0;
    left: 0;
    max-height: 5vh;
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

  @media ${Device.tablet} {
    height: 100vh;
    padding: 0px 30px 0 0;
    box-sizing: initial;
  }
`;
