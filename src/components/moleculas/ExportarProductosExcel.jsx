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
  const [tipoExportacion, setTipoExportacion] = useState("general");

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

  const obtenerDatosGenerales = async (marcaId) => {
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
      .eq("marca_id", marcaId)
      .order("codigo");

    if (error) throw error;

    return data.map((producto) => {
      const cajasConCantidad = Array.isArray(producto.cajas)
        ? producto.cajas.filter((caja) => caja.cantidad > 0).length
        : 0;

      const registrosSuelto = Array.isArray(producto.suelto)
        ? producto.suelto.length
        : 0;

      const totalTarimas = cajasConCantidad + registrosSuelto;

      const cantidadSuelto =
        producto.suelto?.reduce(
          (total, item) => total + (item.cantidad || 0),
          0
        ) || 0;

      const cantidadPiso =
        producto.piso?.reduce(
          (total, item) => total + (item.cantidad || 0),
          0
        ) || 0;

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
  };

  const obtenerDatosConCajas = async (marcaId) => {
    const { data: productos, error: errorProductos } = await supabase
      .from("productos")
      .select("id, codigo, nombre, cantidad, marcas(nombre)")
      .eq("marca_id", marcaId)
      .order("codigo");

    if (errorProductos) throw errorProductos;

    const datosCompletos = [];

    for (const producto of productos) {
      const [cajasResult, sueltosResult, pisosResult] = await Promise.all([
        supabase
          .from("cajas")
          .select(
            `
            id,
            cantidad,
            codigo_barras,
            fecha_caducidad,
            fecha_entrada,
            racks(codigo_rack)
          `
          )
          .eq("producto_id", producto.id),

        supabase
          .from("suelto")
          .select(
            `
            id,
            cantidad,
            codigo_barras,
            fecha_caducidad,
            fecha_entrada
          `
          )
          .eq("producto_id", producto.id),

        supabase
          .from("piso")
          .select(
            `
            id,
            cantidad,
            codigo_barras,
            fecha_caducidad
          `
          )
          .eq("producto_id", producto.id),
      ]);

      const cajas = cajasResult.data || [];
      const sueltos = sueltosResult.data || [];
      const pisos = pisosResult.data || [];

      if (cajas.length === 0 && sueltos.length === 0 && pisos.length === 0) {
        datosCompletos.push({
          CODIGO: producto.codigo,
          PRODUCTO: producto.nombre,
          MARCA: producto.marcas?.nombre || "",
          TIPO_REGISTRO: "RACK",
          CANTIDAD: producto.cantidad || 0,
          CODIGO_BARRAS: "",
          FECHA_CADUCIDAD: "",
          UBICACION: "",
          FECHA_ENTRADA: "",
        });
      } else {
        cajas.forEach((caja) => {
          datosCompletos.push({
            CODIGO: producto.codigo,
            PRODUCTO: producto.nombre,
            MARCA: producto.marcas?.nombre || "",
            TIPO_REGISTRO: "CAJA",
            CANTIDAD: caja.cantidad || 0,
            CODIGO_BARRAS: caja.codigo_barras || "-",
            FECHA_CADUCIDAD: caja.fecha_caducidad || "-",
            UBICACION: caja.racks?.codigo_rack || "-",
            FECHA_ENTRADA: caja.fecha_entrada?.split("T")[0] || "-",
          });
        });

        sueltos.forEach((suelto) => {
          datosCompletos.push({
            CODIGO: producto.codigo,
            PRODUCTO: producto.nombre,
            MARCA: producto.marcas?.nombre || "",
            TIPO_REGISTRO: "SUELTO",
            CANTIDAD: suelto.cantidad || 0,
            CODIGO_BARRAS: suelto.codigo_barras || "-",
            FECHA_CADUCIDAD: suelto.fecha_caducidad || "-",
            UBICACION: "SUELTO",
            FECHA_ENTRADA: suelto.fecha_entrada?.split("T")[0] || "-",
          });
        });

        pisos.forEach((piso) => {
          datosCompletos.push({
            CODIGO: producto.codigo,
            PRODUCTO: producto.nombre,
            MARCA: producto.marcas?.nombre || "",
            TIPO_REGISTRO: "PISO",
            CANTIDAD: piso.cantidad || 0,
            CODIGO_BARRAS: piso.codigo_barras || "-",
            FECHA_CADUCIDAD: piso.fecha_caducidad || "-",
            UBICACION: "EN PISO",
            FECHA_ENTRADA: "-",
          });
        });
      }
    }

    return datosCompletos;
  };

  const crearExcelBonito = (datosExcel, tipoExportacion) => {
    const ws = XLSX.utils.json_to_sheet(datosExcel);

    const headerStyle = {
      fill: { fgColor: { rgb: "1f4788" } },
      font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    const dataStyle = {
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "e0e0e0" } },
        bottom: { style: "thin", color: { rgb: "e0e0e0" } },
        left: { style: "thin", color: { rgb: "e0e0e0" } },
        right: { style: "thin", color: { rgb: "e0e0e0" } },
      },
    };

    const numberStyle = {
      ...dataStyle,
      alignment: { horizontal: "center", vertical: "center" },
      numFmt: "#,##0",
    };

    const headers = Object.keys(datosExcel[0] || {});
    const headerRange = XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: headers.length - 1, r: 0 },
    });

    headers.forEach((header, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      if (!ws[cellAddress]) ws[cellAddress] = {};
      ws[cellAddress].s = headerStyle;
    });

    datosExcel.forEach((row, rowIndex) => {
      headers.forEach((header, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({
          r: rowIndex + 1,
          c: colIndex,
        });
        if (!ws[cellAddress]) ws[cellAddress] = {};

        if (
          header.includes("CANTIDAD") ||
          header === "TOTAL" ||
          header === "TARIMAS"
        ) {
          ws[cellAddress].s = numberStyle;
        } else {
          ws[cellAddress].s = dataStyle;
        }

        if (tipoExportacion === "detallado" && header === "TIPO_REGISTRO") {
          const tipoRegistro = row[header];
          let fillColor = "ffffff";

          switch (tipoRegistro) {
            case "CAJA":
              fillColor = "e3f2fd";
              break;
            case "SUELTO":
              fillColor = "fff3e0";
              break;
            case "PISO":
              fillColor = "ffebee";
              break;
            case "RACK":
              fillColor = "f3e5f5";
              break;
          }

          ws[cellAddress].s = {
            ...dataStyle,
            fill: { fgColor: { rgb: fillColor } },
          };
        }
      });
    });

    const colWidths = headers.map((header) => {
      let maxWidth = header.length;
      datosExcel.forEach((row) => {
        const cellValue = String(row[header] || "");
        if (cellValue.length > maxWidth) {
          maxWidth = cellValue.length;
        }
      });
      return { wch: Math.min(maxWidth + 3, 60) };
    });

    ws["!cols"] = colWidths;

    return ws;
  };

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
      let datosExcel;
      let nombreHoja;

      if (tipoExportacion === "general") {
        datosExcel = await obtenerDatosGenerales(marcaSeleccionada);
        nombreHoja = "Resumen Productos";
      } else {
        datosExcel = await obtenerDatosConCajas(marcaSeleccionada);
        nombreHoja = "Detalle Completo";
      }

      if (datosExcel.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin productos",
          text: "No hay productos para la marca seleccionada",
        });
        setIsLoading(false);
        return;
      }

      const ws = crearExcelBonito(datosExcel, tipoExportacion);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

      const marcaNombre =
        marcas.find((m) => m.id == marcaSeleccionada)?.nombre || "Marca";
      const fechaHoy = new Date().toISOString().split("T")[0];
      const tipoSufijo = tipoExportacion === "general" ? "Resumen" : "Completo";
      const nombreArchivo = `Inventario_${marcaNombre}_${tipoSufijo}_${fechaHoy}.xlsx`;

      XLSX.writeFile(wb, nombreArchivo);

      const tipoTexto =
        tipoExportacion === "general" ? "resumen" : "detalle completo";
      Swal.fire({
        icon: "success",
        title: "Exportación exitosa",
        text: `Se exportó el ${tipoTexto} con ${datosExcel.length} registros`,
        timer: 2500,
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

              <div className="campo">
                <label>Tipo de Exportación:</label>
                <select
                  value={tipoExportacion}
                  onChange={(e) => setTipoExportacion(e.target.value)}
                >
                  <option value="general">
                    General - Resumen por producto
                  </option>
                  <option value="detallado">
                    Detallado - Incluir información de cajas
                  </option>
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
                  titulo={`Exportar ${
                    tipoExportacion === "general" ? "Resumen" : "Completo"
                  }`}
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
    width: 600px;
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
            padding: 12px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            background: ${({ theme }) => theme.bgtotal};
            color: ${({ theme }) => theme.textprincipal};
            font-size: 14px;
            transition: border-color 0.2s;

            &:focus {
              outline: none;
              border-color: ${v.colorBotones};
              box-shadow: 0 0 0 3px ${v.colorBotones}20;
            }
          }
        }

        .actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 25px;
        }
      }
    }
  }
`;
