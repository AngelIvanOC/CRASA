import styled from "styled-components";
import { AccionTabla } from "../../../index";
import { v } from "../../../styles/variables";
import { Icon } from "@iconify/react";

export function ContentAccionesTabla({
  funcionEditar,
  funcionEliminar,
  funcionSurtir,
  funcionVer,
}) {
  return (
    <Container>
      {funcionEditar && (
        <AccionTabla
          funcion={funcionEditar}
          fontSize="18px"
          color="#7d7d7d"
          icono={<v.iconeditarTabla />}
        />
      )}
      {funcionEliminar && (
        <AccionTabla
          funcion={funcionEliminar}
          fontSize="20px"
          color="#f76e8e"
          icono={<Icon icon="material-symbols:delete" />}
        />
      )}
      {funcionSurtir && (
        <AccionTabla
          funcion={funcionSurtir}
          fontSize="20px"
          color={v.verde}
          icono={<Icon icon="mdi:truck-fast" />}
        />
      )}
      {funcionVer && (
        <AccionTabla
          funcion={funcionVer}
          fontSize="20px"
          color={v.colorPrincipal}
          icono={<Icon icon="mdi:eye" />}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  @media (max-width: 48em) {
    justify-content: end;
  }
`;
