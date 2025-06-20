{
  /*import styled from "styled-components";
import {
  Btnsave,
  Title,
  Buscador,
  useCategoriasStore,
  TablaCategorias,
  RegistrarCategorias,
} from "../../index";
import { v } from "../../styles/variables";
import { useState } from "react";
export function CategoriasTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { datacategorias } = useCategoriasStore();
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
        <RegistrarCategorias
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}
      <section className="area1">
        <Title>Categorias</Title>
        <Btnsave
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="Nueva Categoria"
          icono={<v.iconoagregar />}
          color="#fff"
        />
      </section>
      <section className="area2">
        <Buscador />
      </section>

      <section className="main">
        <TablaCategorias data={datacategorias} />
      </section>
    </Container>
  );
}
const Container = styled.div`
  height: calc(100vh - 30px);
  padding: 15px 15px 15px 0;
  display: grid;
  grid-template:
    "area1" 60px
    "area2" 60px
    "main" auto;

  .area1 {
    grid-area: area1;
    background-color: rgba(0, 0, 255, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding: 0 15px;
    border-radius: 5px 5px 0 0;
  }

  .area2 {
    grid-area: area2;
    background-color: rgba(0, 255, 0, 0.2);
    display: flex;
    justify-content: end;
    align-items: center;
  }

  .main {
    grid-area: main;
    background-color: rgba(255, 0, 255, 0.2);
    border-radius: 0 0 5px 5px;
  }
`;
*/
}
