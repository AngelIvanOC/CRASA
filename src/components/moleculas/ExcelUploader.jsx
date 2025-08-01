import React, { useRef } from "react";
import { Btnsave } from "../../index";
import { v } from "../../styles/variables";

export const ExcelUploader = ({ onFileSelect, excelPreview, isProcessing }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="excel-upload-section">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls"
        style={{ display: "none" }}
      />

      <Btnsave
        funcion={() => fileInputRef.current.click()}
        titulo={isProcessing ? "Procesando..." : "Subir Excel"}
        icono={<v.iconoagregar />}
        bgcolor="#217346"
        color="#fff"
        disabled={isProcessing}
      />

      {excelPreview && (
        <div
          className="excel-preview"
          style={{
            marginTop: "15px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4 style={{ marginBottom: "10px", color: "#495057" }}>
            Vista Previa del Excel
          </h4>
          <div style={{ marginBottom: "10px" }}>
            <strong>Marca:</strong> {excelPreview.marca}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Total de productos:</strong> {excelPreview.totalProductos}
          </div>
          {excelPreview.productos.length > 0 && (
            <div>
              <strong>Primeros productos:</strong>
              <ul style={{ marginTop: "5px", paddingLeft: "20px" }}>
                {excelPreview.productos.map((producto, index) => (
                  <li key={index}>
                    {producto.codigo} - Cantidad: {producto.cantidad}
                  </li>
                ))}
              </ul>
              {excelPreview.totalProductos > 5 && (
                <p style={{ fontStyle: "italic", color: "#6c757d" }}>
                  ... y {excelPreview.totalProductos - 5} productos más
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
