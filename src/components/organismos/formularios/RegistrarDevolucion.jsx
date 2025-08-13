import React, { useState } from "react";
import styled from "styled-components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "../../../index";
import { Btnsave, PdfUploader } from "../../../index";
import { v } from "../../../styles/variables";
import { usePdfReader } from "../../../hooks/usePdfReader";
import { insertDevolucionWithProducts } from "../../../services/devolucionService";
import Swal from "sweetalert2";
import { validarProductosEnMarca } from "../../../services/devolucionService";

export function RegistrarDevolucion({ onClose, setIsExploding }) {
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  const {
    pdfFile,
    pdfPreview,
    extractedData: pdfData,
    isProcessing: isPdfProcessing,
    processPdfFile,
  } = usePdfReader();

  const { mutate: doInsertarDevolucion } = useMutation({
    mutationFn: () => insertDevolucionWithProducts(pdfData, pdfFile),
    mutationKey: "insertar devolucion piso",
    onError: (err) => {
      console.error("Error al procesar devolución:", err);
      setIsPending(false);
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "¡Devolución registrada!",
        text: "La devolución se ha procesado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries(["mostrar ventas"]);
      queryClient.invalidateQueries(["mostrar piso"]);
      cerrarFormulario();
      setIsPending(false);
    },
  });

  const procesarDevolucion = async () => {
    if (!pdfData || !pdfData.productos || pdfData.productos.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No hay datos",
        text: "Por favor, sube un PDF válido con productos para procesar.",
      });
      return;
    }

    if (!pdfFile) {
      Swal.fire({
        icon: "warning",
        title: "Archivo requerido",
        text: "Se necesita el archivo PDF para procesar la devolución.",
      });
      return;
    }

    setIsPending(true);

    const productos = pdfData.productos;
    const codigosNoEncontrados = await validarProductosEnMarca(productos);

    if (codigosNoEncontrados.length > 0) {
      const mensaje =
        codigosNoEncontrados.length === 1
          ? `El producto ${codigosNoEncontrados[0]} no se ha encontrado en la marca.`
          : `Los productos ${codigosNoEncontrados.join(
              ", "
            )} no se han encontrado en la marca.`;

      const { isConfirmed } = await Swal.fire({
        title: "¿Deseas continuar?",
        text: `${mensaje} ¿Deseas ignorarlos y continuar?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ignorar y continuar",
        cancelButtonText: "Cancelar",
      });

      if (!isConfirmed) {
        setIsPending(false);
        return;
      }

      pdfData.productos = productos.filter(
        (p) => !codigosNoEncontrados.includes(p.codigo)
      );

      if (pdfData.productos.length === 0) {
        Swal.fire(
          "Sin productos válidos",
          "No queda ningún producto para procesar.",
          "info"
        );
        setIsPending(false);
        return;
      }
    }

    doInsertarDevolucion();
  };

  const cerrarFormulario = () => {
    onClose();
    if (setIsExploding) setIsExploding(true);
  };

  const handleFileSelect = async (file) => {
    try {
      await processPdfFile(file);
    } catch (error) {
      console.error("Error procesando archivo PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error procesando PDF",
        text: "Hubo un problema al leer el archivo PDF. Verifica que sea un archivo válido.",
      });
    }
  };

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>Procesar Devolución</h1>
            </section>
            <section>
              <span onClick={onClose}>x</span>
            </section>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <PdfUploader
              onFileSelect={handleFileSelect}
              pdfPreview={pdfPreview}
              isProcessing={isPdfProcessing}
            />
          </div>

          {/* ✅ Mostrar información extraída */}
          {pdfData && pdfData.productos && (
            <div
              style={{
                marginBottom: "15px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "5px",
                border: "1px solid #e9ecef",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>
                Información extraída:
              </h4>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                <strong>Pedido:</strong> {pdfData.pedidoNo || "No detectado"}
              </p>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                <strong>Marca:</strong> {pdfData.marca || "No detectado"}
              </p>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                <strong>Productos encontrados:</strong>{" "}
                {pdfData.productos.length}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <Btnsave
              funcion={procesarDevolucion}
              icono={<v.iconoguardar />}
              titulo="Procesar Devolución"
              bgcolor={v.colorBotones}
              color="#fff"
              disabled={!pdfData || !pdfData.productos || !pdfFile}
            />
          </div>
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
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

    .formulario {
      .form-subcontainer {
        gap: 20px;
        display: flex;
        flex-direction: column;
      }
    }
  }
`;
