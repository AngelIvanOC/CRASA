import styled from "styled-components";
import { ClockLoader } from "react-spinners";
export function Spinner() {
  return (
    <Container>
      <ClockLoader color="#2264E5" size={200} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
