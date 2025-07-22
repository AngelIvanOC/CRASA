import styled from "styled-components";
import {
  Title,
  useUsuariosStore,
  TablaUsuarios,
  Btnsave,
  Buscador,
  RegistrarUsuario,
} from "../../index";
import { v } from "../../styles/variables";
import { useState } from "react";
import { Device } from "../../styles/breakpoints";

export function UsuariosTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  const { dataTodosUsuarios } = useUsuariosStore();

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
  }

  return (
    <Container>
      {openRegistro && (
        <RegistrarUsuario
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
          setIsExploding={setIsExploding}
        />
      )}

      <Title className="titulo" $colortexto="#9291A5">
        <img src={v.emojiUsuarios} alt="" /> USUARIOS
      </Title>

      <section className="main">
        <section className="header">
          <Buscador />

          <Btnsave
            funcion={nuevoRegistro}
            bgcolor={v.colorBotones}
            titulo="Nuevo Usuario"
            icono={<v.iconoagregar />}
            color="#fff"
          />
        </section>

        <TablaUsuarios
          data={dataTodosUsuarios}
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
