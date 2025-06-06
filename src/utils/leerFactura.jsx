import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function leerFacturaPDF(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      const totalPages = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      resolve(fullText);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
