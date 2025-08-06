import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, supabase } from "../../../index";
import {
  Btnsave,
  useVentasStore,
  VentaForm,
  PdfUploader,
  InputText,
} from "../../../index";
import { v } from "../../../styles/variables";
import { ExcelUploader } from "../../moleculas/ExcelUploader"; // Nuevo

// Importar nuevos módulos
import { usePdfReader } from "../../../hooks/usePdfReader";
import { useExcelReader } from "../../../hooks/useExcelReader"; // Nuevo
import {
  insertVentaWithProducts,
  insertVentaWithExcelProducts, // Nuevo
} from "../../../services/ventaService";

export function RegistrarVenta({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarVenta } = useVentasStore();
  const [isPending, setIsPending] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [uploadType, setUploadType] = useState("pdf"); // "pdf" o "excel"
  const queryClient = useQueryClient();
  const [usuarios, setUsuarios] = useState([]);

  // Hook para PDF
  const {
    pdfFile,
    pdfPreview,
    extractedData: pdfData,
    isProcessing: isPdfProcessing,
    processPdfFile,
  } = usePdfReader();

  // Hook para Excel
  const {
    excelFile,
    excelPreview,
    extractedData: excelData,
    isProcessing: isExcelProcessing,
    processExcelFile,
  } = useExcelReader();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();

  // Mutation para insertar con PDF
  const { mutate: doInsertarPdf } = useMutation({
    mutationFn: (data) =>
      insertVentaWithProducts({ ...data, pdfFile }, pdfData, insertarVenta),
    mutationKey: "insertar venta pdf",
    onError: (err) => {
      console.error("Error al insertar venta con PDF:", err);
      setIsPending(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar ventas"]);
      cerrarFormulario();
      setIsPending(false);
    },
  });

  // Mutation para insertar con Excel
  const { mutate: doInsertarExcel } = useMutation({
    mutationFn: (data) =>
      insertVentaWithExcelProducts(data, excelData, insertarVenta, excelFile),
    mutationKey: "insertar venta excel",
    onError: (err) => {
      console.error("Error al insertar venta con Excel:", err);
      setIsPending(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar ventas"]);
      cerrarFormulario();
      setIsPending(false);
    },
  });

  const handlesub = (data) => {
    setIsPending(true);

    if (uploadType === "excel" && excelData) {
      doInsertarExcel(data);
    } else if (uploadType === "pdf" && pdfData) {
      doInsertarPdf(data);
    } else {
      // Inserción manual normal
      setIsPending(false);
      console.error("No hay datos para insertar");
    }
  };

  const cerrarFormulario = () => {
    onClose();
    if (setIsExploding) setIsExploding(true);
  };

  const handleFileSelect = async (file) => {
    try {
      const data = await processPdfFile(file);
      autocompletarFormulario(data);
    } catch (error) {
      console.error("Error procesando archivo PDF:", error);
    }
  };

  const handleExcelSelect = async (file) => {
    try {
      const data = await processExcelFile(file);
      autocompletarFormulario(data);
    } catch (error) {
      console.error("Error procesando archivo Excel:", error);
    }
  };

  const autocompletarFormulario = (data) => {
    if (data) {
      if (data.pedidoNo) setValue("codigo", data.pedidoNo);
      if (data.cantidadProductos)
        setValue("cantidad_productos", data.cantidadProductos);
      if (data.cantidadTotal) setValue("cantidad_total", data.cantidadTotal);
      if (data.fecha) setValue("fecha", data.fecha);

      // Buscar marca
      if (marcas.length > 0 && data.marca) {
        const marcaEncontrada = marcas.find((m) =>
          m.nombre.toLowerCase().includes(data.marca.toLowerCase())
        );
        if (marcaEncontrada) {
          setValue("marca_id", marcaEncontrada.id);
        }
      }
    }
  };

  // Cargar marcas
  useEffect(() => {
    async function cargarMarcas() {
      const { data } = await supabase.from("marcas").select("*");
      setMarcas(data || []);
    }
    cargarMarcas();
  }, []);

  // Reset form when editing
  useEffect(() => {
    if (accion === "Editar") {
      reset({
        codigo: dataSelect.codigo,
        marca_id: dataSelect.marca_id || "",
        cantidad_productos: dataSelect.cantidad_productos,
        cantidad_total: dataSelect.cantidad_total,
        fecha: dataSelect.fecha
          ? new Date(dataSelect.fecha).toISOString().split("T")[0]
          : "",
      });
    } else {
      reset({
        codigo: "",
        marca_id: "",
        cantidad_productos: "",
        cantidad_total: "",
        fecha: "",
      });
    }
  }, [accion, dataSelect, reset]);

  // Cargar usuarios
  useEffect(() => {
    async function cargarDatos() {
      const [usuariosData] = await Promise.all([
        supabase.from("usuarios").select("*").eq("id_rol", 2).order("nombres"),
      ]);

      setUsuarios(usuariosData.data || []);

      console.log("Usuarios cargados:", usuariosData.data);
    }

    cargarDatos();
  }, []);

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>
                {accion === "Editar" ? "Editar venta" : "Registrar nueva venta"}
              </h1>
            </section>
            <section>
              <span onClick={onClose}>x</span>
            </section>
          </div>

          {/* Selector de tipo de archivo */}
          {accion !== "Editar" && (
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
              >
                <button
                  type="button"
                  onClick={() => setUploadType("pdf")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor:
                      uploadType === "pdf" ? v.colorBotones : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Factura PDF
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("excel")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor:
                      uploadType === "excel" ? "#217346" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Archivo Excel
                </button>
              </div>

              {/* Componentes para subir archivos */}
              {uploadType === "pdf" ? (
                <PdfUploader
                  onFileSelect={handleFileSelect}
                  pdfPreview={pdfPreview}
                  isProcessing={isPdfProcessing}
                />
              ) : (
                <ExcelUploader
                  onFileSelect={handleExcelSelect}
                  excelPreview={excelPreview}
                  isProcessing={isExcelProcessing}
                />
              )}

              <section>
                <article>
                  <InputText>
                    <select
                      className="form__field"
                      {...register("usuario", {
                        required: true,
                      })}
                      defaultValue={dataSelect?.usuario || ""}
                    >
                      <option value="">Seleccione encargado</option>
                      {usuarios?.map((usuario) => (
                        <option key={usuario.id} value={usuario.id_auth}>
                          {usuario.nombres}
                        </option>
                      ))}
                    </select>
                    <label className="form__label">Usuario</label>
                    {errors.usuario?.type === "required" && (
                      <p>Campo requerido</p>
                    )}
                  </InputText>
                </article>
              </section>
            </div>
          )}

          <form className="formulario" onSubmit={handleSubmit(handlesub)}>
            {/* Componente del formulario */}
            <VentaForm
              register={register}
              errors={errors}
              marcas={marcas}
              dataSelect={dataSelect}
              accion={accion}
              usuarios={usuarios}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <Btnsave
                icono={<v.iconoguardar />}
                titulo="Guardar"
                bgcolor={v.colorBotones}
                color="#fff"
              />

              {uploadType === "excel" && (
                <Btnsave
                  funcion={() => {
                    const link = document.createElement("a");
                    link.href =
                      "https://tgftzyihxjojnnbmlecn.supabase.co/storage/v1/object/public/imagenes//FORMATO_VENTA.xlsx";
                    link.download = "/assets/FORMATO_VENTA.xlsx";
                    link.click();
                  }}
                  bgcolor={v.colorBotones}
                  titulo="Descargar Formato"
                  icono={<v.iconoguardar />}
                  color="#fff"
                />
              )}
            </div>
          </form>
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
  /* Mismos estilos existentes */
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
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
    padding: 20px;
    z-index: 100;
    max-height: 90vh;
    overflow-y: auto;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h1 {
        font-size: 20px;
        font-weight: 500;
      }
      span {
        font-size: 20px;
        cursor: pointer;
      }
    }

    .pdf-upload-section {
      margin-bottom: 10px;
      .pdf-preview {
        margin-top: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        overflow: hidden;
      }
    }

    .formulario {
      .form-subcontainer {
        gap: 20px;
        display: flex;
        flex-direction: column;
      }
    }
  }
`;
