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
import SidebarMovile from "./components/organismos/sidebar/SidebarMovile";
import { Device } from "./styles/breakpoints";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useSupabaseRealtime } from "./store/useSupabaseRealtime";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { themeStyle } = useThemeStore();
  const { pathname } = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    }

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  useSupabaseRealtime([
    "productos",
    "ventas",
    "cajas",
    "detalle_ventas",
    "racks",
  ]);

  return (
    <ThemeProvider theme={themeStyle}>
      <AuthContextProvider>
        <GlobalStyles />
        {pathname === "/login" ? (
          <Login />
        ) : (
          <Container>
            <section className="contentSidebar">
              <Sidebar
                state={sidebarOpen}
                setState={() => setSidebarOpen(!sidebarOpen)}
                ref={sidebarRef}
              />
            </section>
            <section className="contentMenuambur">
              <section className="contentNavbarMobile">
                <SidebarMovile
                  isOpen={mobileMenuOpen}
                  setIsOpen={setMobileMenuOpen}
                />
              </section>
            </section>
            <section className="contentRouters">
              <MyRoutes />
            </section>
          </Container>
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
  }

  .contentRouters {
    grid-template-columns: 1;
    width: 100%;
    padding-top: 70px;
  }
  @media ${Device.tablet} {
    grid-template-columns: 125px 1fr;
    height: 100vh;
    .contentSidebar {
      display: initial;
      z-index: 10;
    }
    .contentMenuambur {
      display: none;
    }
    .contentRouters {
      grid-column: 2;
      padding-top: 0;
      z-index: 1;
    }
  }
`;
export default App;
