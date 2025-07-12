import styled from "styled-components";
import { LinksArray, SecondarylinksArray, ToggleTema } from "../../../index";
import { v } from "../../../styles/variables";
import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/AuthStore";

export default function SidebarMovile({ isOpen, setIsOpen }) {
  const { cerrarSesion } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
    setIsOpen(false); // Cerrar el menú después del logout
  };

  const handleLinkClick = () => {
    setIsOpen(false); // Cerrar el menú cuando se selecciona un enlace
  };

  return (
    <>
      {/* Header con menú hamburguesa */}
      <Header>
        <LogoSection>
          <span className="logo">CRASA</span>
        </LogoSection>

        <HamburgerButton onClick={() => setIsOpen(!isOpen)} $isopen={isOpen}>
          <span></span>
          <span></span>
          <span></span>
        </HamburgerButton>
      </Header>

      {/* Overlay para cerrar el menú */}
      {isOpen && <Overlay onClick={() => setIsOpen(false)} />}

      {/* Menú lateral */}
      <MobileMenu $isopen={isOpen}>
        <MenuHeader>
          <div className="logo-section">
            <span className="logo">CRASA</span>
          </div>
          <CloseButton onClick={() => setIsOpen(false)}>
            <Icon icon="material-symbols:close" />
          </CloseButton>
        </MenuHeader>

        <MenuContent>
          {/* Links principales */}
          <LinkSection>
            {LinksArray.map(({ icon, label, to }) => (
              <LinkContainer key={label}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `menu-link${isActive ? ` active` : ``}`
                  }
                  onClick={handleLinkClick}
                >
                  <Icon className="link-icon" icon={icon} />
                  <span className="link-label">{label}</span>
                </NavLink>
              </LinkContainer>
            ))}
          </LinkSection>

          <Divider />

          {/* Links secundarios */}
          <LinkSection>
            {SecondarylinksArray.map(({ icon, label, to, color }) => (
              <LinkContainer key={label}>
                {label === "Salir" ? (
                  <button
                    className="menu-link logout-button"
                    onClick={handleLogout}
                  >
                    <Icon className="link-icon" icon={icon} style={{ color }} />
                    <span className="link-label">{label}</span>
                  </button>
                ) : (
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `menu-link${isActive ? ` active` : ``}`
                    }
                    onClick={handleLinkClick}
                  >
                    <Icon className="link-icon" icon={icon} style={{ color }} />
                    <span className="link-label">{label}</span>
                  </NavLink>
                )}
              </LinkContainer>
            ))}
          </LinkSection>

          <MenuFooter>
            <ToggleTema />
          </MenuFooter>
        </MenuContent>
      </MobileMenu>
    </>
  );
}

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  @media (min-width: 768px) {
    display: none;
  }
`;

const LogoSection = styled.div`
  .logo {
    font-size: 24px;
    font-weight: bold;
    color: ${({ theme }) => theme.text};
  }
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  padding: 0;

  span {
    display: block;
    height: 2px;
    width: 100%;
    background: ${({ theme }) => theme.text};
    border-radius: 2px;
    transition: 0.3s ease;
    transform-origin: center;

    &:nth-child(1) {
      transform: ${({ $isopen }) =>
        $isopen ? "rotate(45deg) translate(6px, 6px)" : "rotate(0)"};
    }

    &:nth-child(2) {
      opacity: ${({ $isopen }) => ($isopen ? "0" : "1")};
    }

    &:nth-child(3) {
      transform: ${({ $isopen }) =>
        $isopen ? "rotate(-45deg) translate(6px, -6px)" : "rotate(0)"};
    }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 300px;
  max-width: 85vw;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  transform: translateX(${({ $isopen }) => ($isopen ? "0" : "-100%")});
  transition: transform 0.3s ease;
  z-index: 1002;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);

  @media (min-width: 768px) {
    display: none;
  }
`;

const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.bgAlpha};

  .logo-section {
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: ${({ theme }) => theme.text};
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.bgAlpha};
    border-radius: 50%;
  }
`;

const MenuContent = styled.div`
  padding: 20px 0;
  height: calc(100vh - 90px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colorScroll};
    border-radius: 10px;
  }
`;

const LinkSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 20px;
`;

const LinkContainer = styled.div`
  .menu-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: ${({ theme }) => theme.text};
    padding: 15px 0;
    border-radius: 12px;
    transition: 0.3s ease;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 16px;
    width: 100%;
    text-align: left;

    .link-icon {
      min-width: 24px;
      font-size: 24px;
      margin-right: 15px;
    }

    .link-label {
      font-weight: 600;
      text-transform: uppercase;
    }

    &:hover {
      background: ${({ theme }) => theme.bgAlpha};
      border-radius: 12px;
    }

    &.active {
      color: ${({ theme }) => theme.color1};
      background: ${({ theme }) => theme.bgAlpha};
      border-radius: 12px;
    }
  }

  .logout-button {
    text-align: left;
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.bgAlpha};
  margin: 20px 0;
`;

const MenuFooter = styled.div`
  margin-top: auto;
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.bgAlpha};
`;
