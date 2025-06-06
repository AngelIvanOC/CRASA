import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { parseInvoiceData } from "../utils/invoiceParsers";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const usePdfReader = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processPdfFile = async (file) => {
    if (!file || file.type !== "application/pdf") {
      throw new Error("El archivo no es un PDF válido");
    }

    setIsProcessing(true);
    setPdfFile(file);
    setExtractedData(null);

    try {
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => setPdfPreview(e.target.result);
      reader.readAsDataURL(file);

      // Extraer datos
      const extractedData = await extractDataFromPDF(file);
      setExtractedData(extractedData);

      return extractedData;
    } catch (error) {
      console.error("Error procesando PDF:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const extractDataFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });

    const pdfDocument = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item) => item.str).join("\n") + "\n";
    }

    return parseInvoiceData(fullText);
  };

  const clearPdfData = () => {
    setPdfFile(null);
    setPdfPreview(null);
    setExtractedData(null);
  };

  return {
    pdfFile,
    pdfPreview,
    extractedData,
    isProcessing,
    processPdfFile,
    clearPdfData,
  };
};
