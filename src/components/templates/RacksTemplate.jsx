import styled from "styled-components";
import {
  Btnsave,
  Title,
  Buscador,
  useRacksStore,
  TablaRacks,
  RegistrarRacks,
} from "../../index";
import { v } from "../../styles/variables";

import { useState, useEffect } from "react";

export function RacksTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataRacks, mostrarRacks } = useRacksStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect({});
  }

  useEffect(() => {
    mostrarRacks(); // ✅ Esto carga los racks con sus flags "ocupado" y "productos_info"
  }, []);

  return (
    <Container>
      {openRegistro && (
        <RegistrarRacks
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}

      <Title className="titulo" $colortexto="#9291A5">
        <img src={v.emojiRacks} alt="" /> RACKS
      </Title>

      <section className="main">
        <section className="header">
          <Buscador />

          <Btnsave
            funcion={nuevoRegistro}
            bgcolor={v.colorBotones}
            titulo="Nuevo Rack"
            icono={<v.iconoagregar />}
            color="#fff"
          />
        </section>
        <TablaRacks
          data={dataRacks}
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
