import { useState, useEffect } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import { Btnsave, Spinner } from "../../index";
import * as XLSX from "xlsx";
import { supabase } from "../../index";
import Swal from "sweetalert2";

export function ExportarProductosExcel({ onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");

  // Cargar marcas al montar el componente
  useEffect(() => {
    async function cargarMarcas() {
      const { data } = await supabase
        .from("marcas")
        .select("*")
        .order("nombre");
      setMarcas(data || []);
    }
    cargarMarcas();
  }, []);

  const handleExportar = async () => {
    if (!marcaSeleccionada) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona una marca",
        text: "Debes seleccionar una marca para exportar",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Obtener datos de productos por marca
      const { data, error } = await supabase
        .from("productos")
        .select(
          `
          codigo,
          nombre,
          cantidad,
          marcas(nombre),
          piso(cantidad),
          cajas(id, cantidad),
          suelto(id, cantidad)
        `
        )
        .eq("marca_id", marcaSeleccionada)
        .order("codigo");

      if (error) throw error;

      // Procesar datos para el Excel
      const datosExcel = data.map((producto) => {
        // Calcular tarimas (cajas con cantidad > 0 + registros suelto)
        const cajasConCantidad = Array.isArray(producto.cajas)
          ? producto.cajas.filter((caja) => caja.cantidad > 0).length
          : 0;

        const registrosSuelto = Array.isArray(producto.suelto)
          ? producto.suelto.length
          : 0;

        const totalTarimas = cajasConCantidad + registrosSuelto;

        // Calcular cantidad en suelto
        const cantidadSuelto =
          producto.suelto?.reduce(
            (total, item) => total + (item.cantidad || 0),
            0
          ) || 0;

        // Calcular cantidad en piso
        const cantidadPiso =
          producto.piso?.reduce(
            (total, item) => total + (item.cantidad || 0),
            0
          ) || 0;

        // AGREGAR: Calcular registros de piso
        const registrosPiso = Array.isArray(producto.piso)
          ? producto.piso.length
          : 0;

        // AGREGAR: Calcular total (tarimas + registros de piso)
        const total = cantidadPiso + cantidadSuelto + producto.cantidad;

        return {
          CODIGO: producto.codigo,
          NOMBRE: producto.nombre,
          MARCA: producto.marcas?.nombre || "",
          TOTAL: total,
          TARIMAS: totalTarimas,
          CANTIDAD_RACK: producto.cantidad || 0,
          CANTIDAD_SUELTO: cantidadSuelto,
          CANTIDAD_PISO: cantidadPiso,
        };
      });

      if (datosExcel.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin productos",
          text: "No hay productos para la marca seleccionada",
        });
        setIsLoading(false);
        return;
      }

      // Crear libro de Excel
      const ws = XLSX.utils.json_to_sheet(datosExcel);

      // Configurar estilos para headers
      const headerStyle = {
        fill: { fgColor: { rgb: "0B5394" } }, // Color de fondo azul
        font: { color: { rgb: "FFFFFF" }, bold: true }, // Letra blanca y bold
        alignment: { horizontal: "center", vertical: "center" },
      };

      // Aplicar estilos a los headers (fila 1)
      const headerCells = ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1"];
      headerCells.forEach((cell) => {
        if (!ws[cell]) ws[cell] = {};
        ws[cell].s = headerStyle;
      });

      // Ajustar ancho de columnas al contenido
      const colWidths = [];
      const headers = Object.keys(datosExcel[0] || {});

      headers.forEach((header, colIndex) => {
        let maxWidth = header.length; // Empezar con el ancho del header

        datosExcel.forEach((row) => {
          const cellValue = String(row[header] || "");
          if (cellValue.length > maxWidth) {
            maxWidth = cellValue.length;
          }
        });

        colWidths.push({ wch: Math.min(maxWidth + 2, 50) }); // +2 para padding, máximo 50
      });

      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Productos");

      // Obtener nombre de la marca para el archivo
      const marcaNombre =
        marcas.find((m) => m.id == marcaSeleccionada)?.nombre || "Marca";
      const fechaHoy = new Date().toISOString().split("T")[0];
      const nombreArchivo = `Productos_${marcaNombre}_${fechaHoy}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);

      Swal.fire({
        icon: "success",
        title: "Exportación exitosa",
        text: `Se exportaron ${datosExcel.length} productos`,
        timer: 2000,
        showConfirmButton: false,
      });

      onClose();
    } catch (error) {
      console.error("Error en exportación:", error);
      Swal.fire({
        icon: "error",
        title: "Error en exportación",
        text: "Ocurrió un error durante la exportación",
      });
    }

    setIsLoading(false);
  };

  return (
    <Container>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>Exportar Productos a Excel</h1>
            </section>
            <section>
              <span onClick={onClose}>×</span>
            </section>
          </div>

          <div className="content">
            <div className="form-section">
              <div className="campo">
                <label>Seleccionar Marca:</label>
                <select
                  value={marcaSeleccionada}
                  onChange={(e) => setMarcaSeleccionada(e.target.value)}
                >
                  <option value="">-- Seleccionar Marca --</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="actions">
                <Btnsave
                  funcion={onClose}
                  bgcolor="#6b7280"
                  titulo="Cancelar"
                  color="#fff"
                />

                <Btnsave
                  funcion={handleExportar}
                  bgcolor={v.colorBotones}
                  titulo="Exportar Excel"
                  icono={<v.iconoagregar />}
                  color="#fff"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .sub-contenedor {
    position: relative;
    width: 500px;
    max-width: 90%;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 20px 30px;
    z-index: 100;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 15px;

      h1 {
        font-size: 20px;
        font-weight: 500;
        color: ${({ theme }) => theme.textprincipal};
      }

      span {
        font-size: 24px;
        cursor: pointer;
        color: ${({ theme }) => theme.textsecundario};
        &:hover {
          color: ${({ theme }) => theme.textprincipal};
        }
      }
    }

    .content {
      .form-section {
        .campo {
          margin-bottom: 20px;

          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: ${({ theme }) => theme.textprincipal};
          }

          select {
            width: 100%;
            padding: 10px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            background: ${({ theme }) => theme.bgtotal};
            color: ${({ theme }) => theme.textprincipal};
            font-size: 14px;

            &:focus {
              outline: none;
              border-color: ${v.colorBotones};
            }
          }
        }

        .info {
          margin: 20px 0;
          padding: 15px;
          background: ${({ theme }) => theme.bgtotalFuerte};
          border-radius: 8px;

          p {
            margin-bottom: 10px;
            font-weight: 500;
            color: ${({ theme }) => theme.textprincipal};
          }

          ul {
            margin: 0;
            padding-left: 20px;

            li {
              margin-bottom: 5px;
              color: ${({ theme }) => theme.textsecundario};
              font-size: 14px;
            }
          }
        }

        .actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }
      }
    }
  }
`;
