import React, { useRef } from "react";
import { Btnsave } from "../../index";
import { v } from "../../styles/variables";

export const PdfUploader = ({ onFileSelect, pdfPreview, isProcessing }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="pdf-upload-section">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        style={{ display: "none" }}
      />

      <Btnsave
        funcion={() => fileInputRef.current.click()}
        titulo={isProcessing ? "Procesando..." : "Subir Factura PDF"}
        icono={<v.iconoFlechabajo />}
        bgcolor="#4CAF50"
        color="#fff"
        disabled={isProcessing}
      />

      {pdfPreview && (
        <div className="pdf-preview">
          <iframe
            src={pdfPreview}
            width="100%"
            height="300px"
            title="Vista previa de factura"
          />
        </div>
      )}
    </div>
  );
};
