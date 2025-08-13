import styled from "styled-components";
import { Btnsave, Title, Buscador, TablaProductosVenta } from "../../index";
import { v } from "../../styles/variables";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AsignarResponsable } from "../organismos/formularios/AsignarResponsable";
import { useVentasStore } from "../../index";
import { supabase } from "../../index";

export function ProductosVentaTemplate({
  detalleVenta,
  showBackButton = false,
  backRoute = "/",
  ventaId,
}) {
  const navigate = useNavigate();
  const [openRegistro, SetopenRegistro] = useState(false);
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);

  const [responsableActual, setResponsableActual] = useState(null);
  const [ayudantesActuales, setAyudantesActuales] = useState([]);

  const { mostrarAyudantesVenta } = useVentasStore();

  const [estadoVenta, setEstadoVenta] = useState(null);

  useEffect(() => {
    async function cargarEquipoAsignado() {
      if (ventaId) {
        try {
          const { data: ventaData } = await supabase
            .from("ventas")
            .select(
              `
              id,
              usuario,
              estado,
              usuarios(id, nombres, id_auth)
            `
            )
            .eq("id", ventaId)
            .single();

          setEstadoVenta(ventaData?.estado);

          if (ventaData?.usuarios) {
            setResponsableActual({
              id_auth: ventaData.usuario,
              nombres: ventaData.usuarios.nombres,
              id: ventaData.usuarios.id,
            });
          }

          const ayudantes = await mostrarAyudantesVenta(ventaId);
          setAyudantesActuales(ayudantes);
        } catch (error) {
          console.error("Error cargando equipo:", error);
        }
      }
    }

    cargarEquipoAsignado();
  }, [ventaId, mostrarAyudantesVenta]);

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
  }

  return (
    <Container>
      {openRegistro && (
        <AsignarResponsable
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
          marcaId={
            detalleVenta?.[0]?.marca_id ||
            detalleVenta?.[0]?.productos?.marca_id
          }
          ventaId={ventaId}
          responsableActual={responsableActual}
          ayudantesActuales={ayudantesActuales}
          onEquipoAsignado={(nuevoResponsable, nuevosAyudantes) => {
            setResponsableActual(nuevoResponsable);
            setAyudantesActuales(nuevosAyudantes);
          }}
        />
      )}

      <Title className="titulo" $colortexto="#9291A5">
        {showBackButton && (
          <span onClick={() => navigate(backRoute)} className="back-button">
            <v.felchaizquierdalarga />{" "}
          </span>
        )}
        <img src={v.emojiAlmacen} alt="" /> PRODUCTOS
      </Title>

      <section className="main">
        <section className="header">
          <Buscador />
          {estadoVenta !== "Devolucion" && (
            <div className="header-buttons">
              <Btnsave
                funcion={nuevoRegistro}
                bgcolor={v.colorBotones}
                titulo="Asignar Equipo"
                icono={<v.iconoagregar />}
                color="#fff"
              />
            </div>
          )}
        </section>

        <section
          className={`equipo-info ${
            estadoVenta === "Devolucion" ? "disabled" : ""
          }`}
        >
          <div className="equipo-card">
            <div className="equipo-content">
              <div className="responsable">
                <strong>Responsable:</strong>{" "}
                <span>{responsableActual?.nombres || "Sin asignar"}</span>
              </div>
              <div className="ayudantes">
                <strong>Ayudantes:</strong>
                {ayudantesActuales.length > 0 ? (
                  <ul className="quitar">
                    {ayudantesActuales.map((ayudante, index) => (
                      <li key={index}>
                        {ayudante.usuarios?.nombres || "Nombre no disponible"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span> Sin ayudantes asignados</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <TablaProductosVenta
          data={detalleVenta}
          SetopenRegistro={SetopenRegistro}
          setdataSelect={setdataSelect}
          setAccion={setAccion}
        />
      </section>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0px 30px 0 0;

  .titulo {
    top: 0;
    left: 0;
    max-height: 5vh;
    .back-button {
      cursor: pointer;
    }
  }

  .main {
    max-height: 90vh;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.bgtotal};
    max-height: 100%;
    box-shadow: -4px 0px 4px -2px rgba(0, 0, 0, 0.25),
      2px 2px 4px 0px rgba(0, 0, 0, 0.25);
    overflow: hidden;

    .header {
      grid-area: area2;
      background-color: ${({ theme }) => theme.bgtotalFuerte};
      display: flex;
      justify-content: space-between;
      border-radius: 5px 5px 0 0;
      padding: 15px 20px;
      height: 10vh;
      box-sizing: border-box;

      .header-buttons {
        display: flex;
        gap: 10px;
      }
    }

    .equipo-info {
      height: 6vh;
      box-sizing: border-box;
      padding: 0 20px;
      background-color: ${({ theme }) => theme.bgSecundario || "#f8f9fa"};
      border-bottom: 1px solid ${({ theme }) => theme.borde || "#dee2e6"};

      &.disabled {
        opacity: 0.6;
        pointer-events: none;

        .equipo-card {
          background: #f0f0f0;
          color: #999;

          .responsable,
          .ayudantes {
            strong {
              font-weight: 500;
            }
          }
        }
      }

      .equipo-card {
        background: white;
        padding: 5px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        h4 {
          margin: 0 0 15px 0;
          color: ${({ theme }) => theme.text};
          font-size: 16px;
          font-weight: 600;
        }

        .equipo-content {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 15px;

          @media (max-width: 768px) {
            grid-template-columns: 1fr;
          }

          .responsable,
          .ayudantes {
            strong {
              color: ${({ theme }) => theme.text};
            }

            span {
              color: ${({ theme }) => theme.textSecundario || "#666"};
            }
          }

          .ayudantes {
            display: flex;
            gap: 5px;
            .quitar {
              margin: 0;
              padding: 0;
              list-style: none;

              li {
                color: ${({ theme }) => theme.textSecundario || "#666"};
              }
            }
          }
        }
      }
    }
  }
`;
