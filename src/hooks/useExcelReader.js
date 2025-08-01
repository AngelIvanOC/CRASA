import { useState } from "react";
import * as XLSX from "xlsx";

export const useExcelReader = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [excelPreview, setExcelPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processExcelFile = async (file) => {
    if (!file || !file.name.match(/\.(xlsx|xls)$/)) {
      throw new Error("El archivo no es un Excel válido");
    }

    setIsProcessing(true);
    setExcelFile(file);
    setExtractedData(null);

    try {
      const extractedData = await extractDataFromExcel(file);
      setExtractedData(extractedData);

      // Crear vista previa con los datos extraídos
      setExcelPreview({
        marca: extractedData.marca,
        totalProductos: extractedData.productos?.length || 0,
        productos: extractedData.productos?.slice(0, 5) || [],
      });

      return extractedData;
    } catch (error) {
      console.error("Error procesando Excel:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const extractDataFromExcel = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Obtener la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convertir a JSON manteniendo las celdas vacías
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          // Validar formato
          if (!jsonData || jsonData.length < 3) {
            throw new Error("El archivo Excel debe tener al menos 3 filas");
          }

          // Extraer marca (A1 debe ser "MARCA:" y B1 la marca)
          if (!jsonData[0] || jsonData[0][0] !== "MARCA:") {
            throw new Error("En la celda A1 debe estar el texto 'MARCA:'");
          }

          const marca = jsonData[0][1];
          if (!marca) {
            throw new Error("En la celda B1 debe estar especificada la marca");
          }

          // Validar encabezados (A2="CODIGO", B2="CANTIDAD")
          if (
            !jsonData[1] ||
            jsonData[1][0] !== "CODIGO" ||
            jsonData[1][1] !== "CANTIDAD"
          ) {
            throw new Error(
              "En la fila 2: A2 debe ser 'CODIGO' y B2 debe ser 'CANTIDAD'"
            );
          }

          // Extraer productos (desde la fila 3 en adelante)
          const productos = [];
          for (let i = 2; i < jsonData.length; i++) {
            const row = jsonData[i];

            // Si no hay código, saltar fila
            if (!row || !row[0]) continue;

            const codigoRaw = String(row[0]).trim();
            const codigo = parseInt(codigoRaw);

            const cantidad = parseInt(row[1]) || 0;

            if (!isNaN(codigo) && codigo > 0) {
              productos.push({
                codigo: codigo, // Guardar como número entero
                cantidad,
                marca: marca.toUpperCase(),
              });
              console.log("  ✅ Producto agregado");
            } else {
              console.log("  ❌ Código inválido, fila omitida");
            }
          }

          if (productos.length === 0) {
            throw new Error("No se encontraron productos válidos en el Excel");
          }

          const result = {
            marca: marca.toUpperCase(),
            productos,
            cantidadProductos: productos.length,
            cantidadTotal: productos.reduce((sum, p) => sum + p.cantidad, 0),
            fecha: new Date().toISOString().split("T")[0],
            pedidoNo: `${Date.now()}`, // Código automático para Excel
          };

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsArrayBuffer(file);
    });
  };

  const clearExcelData = () => {
    setExcelFile(null);
    setExcelPreview(null);
    setExtractedData(null);
  };

  return {
    excelFile,
    excelPreview,
    extractedData,
    isProcessing,
    processExcelFile,
    clearExcelData,
  };
};
