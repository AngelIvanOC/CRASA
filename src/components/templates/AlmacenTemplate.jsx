import styled from "styled-components";
import {
  Btnsave,
  Title,
  Buscador,
  useProductosStore,
  TablaProductos,
  RegistrarProductos,
  useUsuariosStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useState } from "react";
import { ModalFiltros } from "../moleculas/ModalFiltros";
import { CargarProductosExcel } from "../moleculas/CargarProductosExcel";
import { ExportarProductosExcel } from "../moleculas/ExportarProductosExcel";

export function AlmacenTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const [openFiltros, setOpenFiltros] = useState(false);
  const [openCargarExcel, setOpenCargarExcel] = useState(false); 
  const [openExportarExcel, setOpenExportarExcel] = useState(false);

  const { dataUsuarios } = useUsuariosStore();
  const esEncargado = dataUsuarios?.id_rol === 3;

  const {
    dataProductos,
    buscarProductosConFiltros,
    mostrarProductosConFiltros,
    setBuscador,
    filtros,
    setFiltros,
  } = useProductosStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
  }

  const handleBuscar = async (valor) => {
    console.log("handleBuscar llamado con valor:", valor);
    setBuscador(valor);
    if (valor.trim() === "") {
      console.log("Valor vacío, mostrando todos los productos con filtros");
      await mostrarProductosConFiltros();
    } else {
      console.log("Buscando productos con:", valor);
      await buscarProductosConFiltros({ buscador: valor });
    }
  };

  const handleApplyFilters = async (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    
    const buscadorActual = useProductosStore.getState().buscador;
    if (buscadorActual && buscadorActual.trim() !== "") {
      await buscarProductosConFiltros({ buscador: buscadorActual });
    } else {
      await mostrarProductosConFiltros();
    }
  };

  return (
    <Container>
      {openRegistro && (
        <RegistrarProductos
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}

      {openCargarExcel && (
        <CargarProductosExcel onClose={() => setOpenCargarExcel(false)} />
      )}

      {openExportarExcel && (
        <ExportarProductosExcel onClose={() => setOpenExportarExcel(false)} />
      )}

      <ModalFiltros
        isOpen={openFiltros}
        onClose={() => setOpenFiltros(false)}
        onApplyFilters={handleApplyFilters}
        filtrosActivos={filtros}
      />

      <Title className="titulo" $colortexto="#9291A5">
        <img src={v.emojiAlmacen} alt="" /> ALMACEN
      </Title>

      <section className="main">
        <section className="header">
          <div className="search-container">
            <FilterButton
              onClick={() => setOpenFiltros(true)}
              $hasFilters={filtros.marca !== ""}
            >
              <v.iconoFiltro />
              {filtros.marca !== "" && <FilterDot />}
            </FilterButton>
            <Buscador setBuscador={handleBuscar} />
          </div>

          {!esEncargado && (
            <>
              <Btnsave
                funcion={() => setOpenExportarExcel(true)}
                bgcolor="#f59e0b" 
                titulo="Exportar Excel"
                icono={<v.iconoagregar />} 
                color="#fff"
              />

              <Btnsave
                funcion={() => setOpenCargarExcel(true)}
                bgcolor="#10b981" 
                titulo="Cargar Excel"
                icono={<v.iconoagregar />} 
                color="#fff"
              />

              <Btnsave
                funcion={nuevoRegistro}
                bgcolor={v.colorBotones}
                titulo="Nuevo Producto"
                icono={<v.iconoagregar />}
                color="#fff"
              />
            </>
          )}
        </section>
        <TablaProductos
          data={dataProductos}
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

      .search-container {
        display: flex;
        gap: 10px;
      }
    }
  }
`;

const FilterButton = styled.button`
  background: ${(props) =>
    props.$hasFilters ? v.colorBotones || "#3b82f6" : "white"};
  color: ${(props) => (props.$hasFilters ? "white" : "#6b7280")};
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s;
  height: 40px;
  width: 40px;

  &:hover {
    background: ${(props) =>
      props.$hasFilters
        ? v.colorBotones
          ? `${v.colorBotones}dd`
          : "#2563eb"
        : "#f3f4f6"};
    border-color: ${(props) =>
      props.$hasFilters ? v.colorBotones || "#3b82f6" : "#9ca3af"};
  }
`;

const FilterDot = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #e5e5e5;
`;
