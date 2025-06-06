import styled, { ThemeProvider } from "styled-components";
import {
  AuthContextProvider,
  GlobalStyles,
  MyRoutes,
  Sidebar,
  ToggleTema,
  useThemeStore,
  Login,
} from "./index";
import { Device } from "./styles/breakpoints";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { themeStyle } = useThemeStore();
  const { pathname } = useLocation();
  return (
    <ThemeProvider theme={themeStyle}>
      <AuthContextProvider>
        <GlobalStyles />
        {pathname != "/login" ? (
          <Container>
            <section className="contentSidebar">
              <Sidebar
                state={sidebarOpen}
                setState={() => setSidebarOpen(!sidebarOpen)}
              />
            </section>
            <section className="contentMenuambur">menu ambur</section>
            <section className="contentRouters">
              <MyRoutes />
            </section>
          </Container>
        ) : (
          <Login />
        )}
        <ReactQueryDevtools initialIsOpen={true} />
      </AuthContextProvider>
    </ThemeProvider>
  );
}

const Container = styled.main`
  display: grid;
  grid-template-columns: 1fr;
  transition: 0.3s ease-in-out;

  .contentSidebar {
    display: none;
  }

  .contentMenuambur {
    position: absolute;
    /*background-color: rgba(53,219, 11, 0.5);*/
  }

  .contentRouters {
    /*background-color: rgba(231,13, 136, 0.5);*/
    grid-template-columns: 1;
    width: 100%;
  }
  @media ${Device.tablet} {
    grid-template-columns: 125px 1fr;
    height: 100vh;
    .contentSidebar {
      display: initial;
    }
    .contentMenuambur {
      display: none;
    }
    .contentRouters {
      grid-column: 2;
    }
  }
`;
export default App;
