import styled from "styled-components";
import { CardSmall } from "../organismos/cards/CardSmall";
import { Btnsave } from "../moleculas/Btnsave";

export function BaseCard({
  titulo,
  children,
  buttonConfig,
  loading,
  emptyMessage = "No hay datos disponibles",
}) {
  return (
    <CardSmall
      titulo={titulo}
      headerButton={
        buttonConfig && (
          <Btnsave
            icono={buttonConfig.icono}
            titulo={buttonConfig.titulo}
            bgcolor={buttonConfig.bgcolor}
            funcion={buttonConfig.funcion}
            width={buttonConfig.width}
          />
        )
      }
    >
      {loading ? <LoadingText>Cargando...</LoadingText> : children}
    </CardSmall>
  );
}

const LoadingText = styled.p`
  text-align: center;
  color: #9291a5;
  margin: 20px 0;
  font-size: 14px;
`;
