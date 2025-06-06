import styled from "styled-components";
import { LinksArray, SecondarylinksArray, ToggleTema } from "../../../index";
import { v } from "../../../styles/variables";
import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";

export function Sidebar({ state, setState }) {
  return (
    <Main $isopen={state.toString()}>
      <Container $isopen={state.toString()} className={state ? "active" : ""}>
        <div className="Logocontent" onClick={() => setState(!state)}>
          <section className={state ? "content open" : "content"}>
            <div className="Linkicon">
              {state ? <v.felchaizquierdalarga /> : <v.iconobarras />}
            </div>
            {state && <span className="label_ver">CRASA</span>}
          </section>
        </div>

        <Divider />

        {LinksArray.map(({ icon, label, to }) => (
          <div
            className={state ? "LinkContainer active" : "LinkContainer"}
            key={label}
          >
            <NavLink
              to={to}
              className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
            >
              <section className={state ? "content open" : "content"}>
                <Icon className="Linkicon" icon={icon} />
                <span className={state ? "label_ver" : "label_oculto"}>
                  {label}
                </span>
              </section>
            </NavLink>
          </div>
        ))}
        <Divider />
        {SecondarylinksArray.map(({ icon, label, to, color }) => (
          <div
            className={state ? "LinkContainer active" : "LinkContainer"}
            key={label}
          >
            <NavLink
              to={to}
              className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
            >
              <section className={state ? "content open" : "content"}>
                <Icon color={color} className="Linkicon" icon={icon} />
                <span className={state ? "label_ver" : "label_oculto"}>
                  {label}
                </span>
              </section>
            </NavLink>
          </div>
        ))}
        <ToggleTema />
      </Container>
    </Main>
  );
}
const Container = styled.div`
  background: ${({ theme }) => theme.bgtotal};
  color: ${(props) => props.theme.text};
  position: relative;
  z-index: 2;
  height: 90vh;
  width: 65px;
  overflow-y: hidden;
  overflow-x: hidden;
  border-radius: 30px;
  box-shadow: -2px 0px 4px rgba(0, 0, 0, 0.25), 4px 4px 2px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: 0.3s ease-in-out;

  .Sidebarbutton-in-logo {
    border-radius: 50%;
    cursor: pointer;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      font-size: 25px; /* IGUAL que .Linkicon */
      color: ${({ theme }) => theme.text};
      font-weight: bold;
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colorScroll};
    border-radius: 10px;
  }

  &.active {
    width: 260px;
  }
  .Logocontent {
    cursor: pointer;
    height: 60px;
    display: flex;
    align-items: center;
    width: 100%;

    .content {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .content.open {
      justify-content: start;
      gap: 20px;
      padding-left: 20px;
      padding-right: 10px;
    }

    .Linkicon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 25px;
      font-size: 25px;
    }

    .label_ver {
      transition: 0.3s ease-in-out;
      opacity: 1;
      display: inline-block;
      font-size: 25px;
      font-weight: bold;
      color: ${(props) => props.theme.text};
    }
  }

  .LinkContainer {
    position: relative;
    text-transform: uppercase;
    font-weight: 700;
    display: flex;
    width: 100%;
    justify-content: center;
  }

  .active {
    position: relative;
    text-transform: uppercase;
    font-weight: 700;
    display: flex;
    width: 100%;
    justify-content: start;
  }

  .Links {
    border-radius: 12px;
    display: flex;
    align-items: center;
    text-decoration: none;
    width: 100%;
    color: ${(props) => props.theme.text};
    position: relative;
    padding: 10px 0;
    .content {
      display: flex;
      justify-content: center;
      width: 100%;
      align-items: center;
      padding: 0;
      .Linkicon {
        min-width: 25px;
        font-size: 25px;

        svg {
          font-size: 25px;
        }
      }

      .label_ver {
        opacity: 1;
        display: initial;
        font-size: 18px;
        font-weight: bold;
      }
      .label_oculto {
        opacity: 0;
        display: none;
      }

      &.open {
        justify-content: start;
        gap: 20px;
        padding-left: 20px;
        padding-right: 10px;
      }
    }

    &:hover {
      background: ${(props) => props.theme.bgAlpha};
      border-radius: 25px;
    }

    &.active {
      color: ${(props) => props.theme.color1};
      font-weight: 600;
    }
  }
`;
const Main = styled.div`
  display: flex;
  align-items: center;
  height: 100vh;
  position: fixed;
  padding: 0 30px;
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  margin: ${() => v.lgSpacing} 0;
`;
