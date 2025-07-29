import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import {
  Btnsave,
  useProductosStore,
  Spinner,
  ConvertirCapitalize,
} from "../../index";
import * as XLSX from "xlsx";
import { supabase } from "../../index";
import Swal from "sweetalert2";

export function CargarProductosExcel({ onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const fileInputRef = useRef();
  const { insertarProductosMasivo } = useProductosStore();
  const [dragOver, setDragOver] = useState(false);

  // Cargar marcas al montar el componente
  useEffect(() => {
    async function cargarMarcas() {
      const { data } = await supabase.from("marcas").select("*");
      setMarcas(data || []);
    }
    cargarMarcas();
  }, []);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Procesar y validar datos
      const productosProcessados = jsonData.map((row, index) => {
        const codigo = row.CODIGO || row.codigo;
        const nombre = row.NOMBRE || row.nombre;
        const marcaNombre = row.MARCA || row.marca;

        // Buscar marca por nombre
        const marcaEncontrada = marcas.find(
          (m) => m.nombre.toLowerCase() === marcaNombre?.toLowerCase()
        );

        return {
          fila: index + 2, // +2 porque Excel inicia en 1 y tiene header
          codigo: codigo ? parseInt(codigo) : null,
          nombre: nombre ? ConvertirCapitalize(nombre.toString()) : null,
          marca_nombre: marcaNombre,
          marca_id: marcaEncontrada?.id || null,
          valido: codigo && nombre && marcaEncontrada,
          errores: [
            !codigo && "Código faltante",
            !nombre && "Nombre faltante",
            !marcaEncontrada &&
              marcaNombre &&
              `Marca "${marcaNombre}" no encontrada`,
            !marcaNombre && "Marca faltante",
          ].filter(Boolean),
        };
      });

      setPreviewData(productosProcessados);
    } catch (error) {
      console.error("Error al procesar archivo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo procesar el archivo Excel",
      });
    }
    setIsLoading(false);
  };

  const handleImportar = async () => {
    const productosValidos = previewData.filter((p) => p.valido);

    if (productosValidos.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin productos válidos",
        text: "No hay productos válidos para importar",
      });
      return;
    }

    const resultado = await Swal.fire({
      title: "Confirmar importación",
      text: `¿Importar ${productosValidos.length} productos válidos?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, importar",
      cancelButtonText: "Cancelar",
    });

    if (!resultado.isConfirmed) return;

    setIsLoading(true);

    try {
      // Preparar datos para inserción masiva
      const productosParaInsertar = productosValidos.map((producto) => ({
        codigo: producto.codigo,
        nombre: producto.nombre,
        marca_id: producto.marca_id,
        cajas: null,
        cantidad: null,
        racks: null,
      }));

      // Usar la nueva función del store
      const resultado = await insertarProductosMasivo(productosParaInsertar);

      setIsLoading(false);

      if (resultado.exitosos > 0) {
        Swal.fire({
          icon: "success",
          title: "Importación completada",
          text: `${resultado.exitosos} productos importados exitosamente${
            resultado.fallidos > 0
              ? `, ${resultado.fallidos} fallidos o duplicados`
              : ""
          }`,
        });
        onClose();
      } else {
        Swal.fire({
          icon: "warning",
          title: "Sin productos importados",
          text: resultado.mensaje || "No se pudo importar ningún producto",
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error en importación:", error);
      Swal.fire({
        icon: "error",
        title: "Error en importación",
        text: "Ocurrió un error durante la importación",
      });
    }
  };

  const productosValidos = previewData.filter((p) => p.valido).length;
  const productosInvalidos = previewData.filter((p) => !p.valido).length;

  return (
    <Container>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>Cargar Productos desde Excel</h1>
            </section>
            <section>
              <span onClick={onClose}>×</span>
            </section>
          </div>

          <div className="content">
            {previewData.length === 0 ? (
              <div className="upload-section">
                <div className="marcas-disponibles">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      padding: "10px",
                    }}
                  >
                    <p style={{ margin: 0, marginRight: "10px" }}>
                      Marcas disponibles:
                    </p>
                    <div className="marcas-list">
                      {marcas.map((marca) => (
                        <span key={marca.id} className="marca-tag">
                          {marca.nombre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                    }}
                  >
                    <Btnsave
                      funcion={() => {
                        const link = document.createElement("a");
                        link.href =
                          "https://tgftzyihxjojnnbmlecn.supabase.co/storage/v1/object/public/imagenes//FORMATO_PRODUCTOS.xlsx";
                        link.download = "/assets/FORMATO_PRODUCTOS.xlsx";
                        link.click();
                      }}
                      bgcolor={v.colorBotones}
                      titulo="Descargar Formato"
                      icono={<v.iconoguardar />}
                      color="#fff"
                    />

                    <Btnsave
                      funcion={() => fileInputRef.current?.click()}
                      bgcolor={v.colorBotones}
                      titulo="Seleccionar Archivo"
                      icono={<v.iconoagregar />}
                      color="#fff"
                    />
                  </div>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (
                      file &&
                      (file.name.endsWith(".xlsx") ||
                        file.name.endsWith(".xls"))
                    ) {
                      handleFileSelect({ target: { files: [file] } });
                    } else {
                      Swal.fire(
                        "Archivo inválido",
                        "Solo se permiten archivos Excel",
                        "warning"
                      );
                    }
                  }}
                  style={{
                    border: `2px dashed ${dragOver ? "#3b82f6" : "#ccc"}`,
                    borderRadius: "10px",
                    padding: "30px",
                    marginBottom: "20px",
                    backgroundColor: dragOver ? "#f0f9ff" : "transparent",
                    transition: "0.3s",
                    cursor: "pointer",
                  }}
                >
                  <p style={{ margin: 0, color: "#666" }}>
                    {dragOver
                      ? "Suelta el archivo aquí"
                      : "Arrastra tu archivo Excel aquí o selecciónalo manualmente"}
                  </p>
                  <p style={{ fontSize: "12px", color: "#999" }}>
                    Formatos soportados: .xlsx, .xls
                  </p>
                </div>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
              </div>
            ) : (
              <div className="preview-section">
                <div className="stats">
                  <div className="stat valid">
                    <strong>{productosValidos}</strong> válidos
                  </div>
                  <div className="stat invalid">
                    <strong>{productosInvalidos}</strong> con errores
                  </div>
                </div>

                <div className="preview-table">
                  <div className="table-header">
                    <span>Fila</span>
                    <span>Código</span>
                    <span>Nombre</span>
                    <span>Marca</span>
                    <span>Estado</span>
                  </div>

                  <div className="table-body">
                    {previewData.slice(0, 10).map((producto, index) => (
                      <div
                        key={index}
                        className={`table-row ${
                          producto.valido ? "valid" : "invalid"
                        }`}
                      >
                        <span>{producto.fila}</span>
                        <span>{producto.codigo || "-"}</span>
                        <span>{producto.nombre || "-"}</span>
                        <span>{producto.marca_nombre || "-"}</span>
                        <span>
                          {producto.valido ? (
                            <span className="status-ok">✓ Válido</span>
                          ) : (
                            <span className="status-error">
                              ✗ {producto.errores.join(", ")}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {previewData.length > 10 && (
                    <div className="table-footer">
                      ... y {previewData.length - 10} productos más
                    </div>
                  )}
                </div>

                <div className="actions">
                  <Btnsave
                    funcion={() => setPreviewData([])}
                    bgcolor="#6b7280"
                    titulo="Seleccionar Otro"
                    color="#fff"
                  />

                  {productosValidos > 0 && (
                    <Btnsave
                      funcion={handleImportar}
                      bgcolor={v.colorBotones}
                      titulo={`Importar ${productosValidos} productos`}
                      icono={<v.iconoguardar />}
                      color="#fff"
                    />
                  )}
                </div>
              </div>
            )}
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
    width: 800px;
    max-width: 90%;
    max-height: 90vh;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 20px 30px;
    z-index: 100;
    overflow-y: auto;

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
      .upload-section {
        text-align: center;

        p {
          margin-bottom: 15px;
          color: ${({ theme }) => theme.textsecundario};
        }

        ul {
          text-align: left;
          margin: 20px 0;
          padding-left: 20px;

          li {
            margin-bottom: 8px;
            color: ${({ theme }) => theme.textsecundario};
          }
        }

        .marcas-disponibles {
          margin: 20px 0;
          padding: 15px;
          background: ${({ theme }) => theme.bgtotalFuerte};
          border-radius: 8px;

          h4 {
            margin-bottom: 10px;
            color: ${({ theme }) => theme.textprincipal};
          }

          .marcas-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .marca-tag {
              background: ${v.colorBotones};
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
            }
          }
        }
      }

      .preview-section {
        .stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;

          .stat {
            padding: 10px 15px;
            border-radius: 8px;
            text-align: center;

            &.valid {
              background: #dcfce7;
              color: #166534;
            }

            &.invalid {
              background: #fef2f2;
              color: #dc2626;
            }
          }
        }

        .preview-table {
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          margin-bottom: 20px;

          .table-header {
            display: grid;
            grid-template-columns: 60px 100px 1fr 120px 1fr;
            gap: 10px;
            padding: 10px;
            background: ${({ theme }) => theme.bgtotalFuerte};
            font-weight: bold;
            border-bottom: 1px solid #e5e5e5;

            span {
              color: ${({ theme }) => theme.textprincipal};
            }
          }

          .table-body {
            max-height: 300px;
            overflow-y: auto;

            .table-row {
              display: grid;
              grid-template-columns: 60px 100px 1fr 120px 1fr;
              gap: 10px;
              padding: 8px 10px;
              border-bottom: 1px solid #f0f0f0;

              &.valid {
                background: #f9fdf9;
              }

              &.invalid {
                background: #fef9f9;
              }

              span {
                color: ${({ theme }) => theme.textsecundario};
                font-size: 14px;

                &.status-ok {
                  color: #16a34a;
                }

                &.status-error {
                  color: #dc2626;
                  font-size: 12px;
                }
              }
            }
          }

          .table-footer {
            padding: 10px;
            text-align: center;
            color: ${({ theme }) => theme.textsecundario};
            font-style: italic;
            background: ${({ theme }) => theme.bgtotalFuerte};
          }
        }

        .actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }
      }
    }
  }
`;
