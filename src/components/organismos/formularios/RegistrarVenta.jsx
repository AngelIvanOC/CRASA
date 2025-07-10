import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Spinner, supabase } from "../../../index";
import {
  Btnsave,
  useVentasStore,
  VentaForm,
  PdfUploader,
} from "../../../index";
import { v } from "../../../styles/variables";

// Importar nuevos módulos
import { usePdfReader } from "../../../hooks/usePdfReader";
import { insertVentaWithProducts } from "../../../services/ventaService";

export function RegistrarVenta({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarVenta } = useVentasStore();
  const [isPending, setIsPending] = useState(false);
  const [marcas, setMarcas] = useState([]);

  // Hook personalizado para PDF
  const { pdfFile, pdfPreview, extractedData, isProcessing, processPdfFile } =
    usePdfReader();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();

  // Mutation para insertar
  const { mutate: doInsertar } = useMutation({
    mutationFn: (data) =>
      insertVentaWithProducts(
        { ...data, pdfFile },
        extractedData,
        insertarVenta
      ),
    mutationKey: "insertar venta",
    onError: (err) => {
      console.error("Error al insertar venta:", err);
      setIsPending(false);
    },
    onSuccess: () => {
      cerrarFormulario();
      setIsPending(false);
    },
  });

  const handlesub = (data) => {
    setIsPending(true);
    doInsertar(data);
  };

  const cerrarFormulario = () => {
    onClose();
    if (setIsExploding) setIsExploding(true);
  };

  const handleFileSelect = async (file) => {
    try {
      const data = await processPdfFile(file);

      // Autocompletar formulario
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
    } catch (error) {
      console.error("Error procesando archivo:", error);
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

          {/* Componente para subir PDF */}
          {accion !== "Editar" && (
            <PdfUploader
              onFileSelect={handleFileSelect}
              pdfPreview={pdfPreview}
              isProcessing={isProcessing}
            />
          )}

          {extractedData?.rawText && (
            <div
              style={{
                whiteSpace: "pre-wrap",
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "#f5f5f5",
                padding: "10px",
                borderRadius: "8px",
                marginTop: "15px",
              }}
            >
              <h3 style={{ marginBottom: "8px", color: "#666" }}>
                Texto extraído del PDF:
              </h3>
              <p>{extractedData.rawText}</p>
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
            />

            <Btnsave
              icono={<v.iconoguardar />}
              titulo="Guardar"
              bgcolor={v.colorBotones}
            />
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
      margin-bottom: 20px;

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
      margin-bottom: 20px;
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
