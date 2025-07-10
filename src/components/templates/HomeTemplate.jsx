import styled from "styled-components";
import { useAuthStore } from "../../store/AuthStore";
export function HomeTemplate() {
  const { cerrarSesion } = useAuthStore();
  return (
    <Container>
      <span>HomeTemplate</span>
      <button onClick={cerrarSesion}>Cerrar</button>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
`;
