import { useState } from "react";
import styled from "styled-components";
import {
  Title,
  InputText2,
  Btnsave,
  Linea,
  Footer,
  useAuthStore,
} from "../../index";
import { v } from "../../styles/variables";
import { Device } from "../../styles/breakpoints";

export function LoginTemplate() {
  const { loginGoogle, loginDirecto, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await loginDirecto(formData.email, formData.password);

    if (success) {
      // Aquí puedes redirigir al usuario o hacer cualquier acción post-login
      console.log("Login exitoso");
    }
  };

  return (
    <Container>
      <div className="card">
        <ContentLogo>
          <img src={v.logo} alt="" />
          <span>CRASA</span>
        </ContentLogo>
        <Title $paddingbottom="40px">Ingresar</Title>

        <form onSubmit={handleSubmit}>
          <InputText2>
            <input
              className="form__field"
              placeholder="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </InputText2>

          <InputText2>
            <input
              className="form__field"
              placeholder="contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </InputText2>

          <Btnsave
            type="submit"
            titulo={loading ? "INGRESANDO..." : "INGRESAR"}
            bgcolor="#1CB0F6"
            color="255, 255, 255"
            width="100%"
            disabled={loading}
          />
        </form>

        <Linea>
          <span>o</span>
        </Linea>

        <Btnsave
          funcion={loginGoogle}
          titulo="Google"
          bgcolor="#fff"
          icono={<v.iconogoogle />}
          disabled={loading}
        />
      </div>

      <Footer />
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
  padding: 0 10px;
  color: ${({ theme }) => theme.text};
  background-color: #000;
  .card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    margin: 20px;
    width: 80%;
    @media ${Device.tablet} {
      width: 400px;
    }
  }
`;

const ContentLogo = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px;
  span {
    font-weight: 700;
  }
  img {
    width: 10%;
  }
`;
