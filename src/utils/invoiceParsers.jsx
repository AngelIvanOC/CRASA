export const parseInvoiceData = (text) => {
  const primeraLinea = text.split("\n")[0].trim();

  if (/^CRASA/i.test(primeraLinea)) return parseCrasa(text);
  if (/Con Alimentos S.A. de C.V./i.test(text)) return parseCon(text);
  if (/lacostena/i.test(text)) return parseCostena(text);
  if (/JUMEX/i.test(text)) return parseJumex(text);

  console.warn("Formato de factura desconocido");
  return null;
};

const parseJumex = (text) => {
  const pedidoMatch = text.match(/Folio [\s\n]*(\d+)/i);
  const fechaMatch = text.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/);
  const totalMatch = text.match(/Total[\s\n\$]*([\d,]+\.\d{2})/);
  const marcaMatch = text.match(/JUMEX/i);

  const pedidoNo = pedidoMatch ? pedidoMatch[1] : null;
  const fecha = fechaMatch ? fechaMatch[1] : null;
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null;
  const marca = marcaMatch ? marcaMatch[0] : null;

  const lineas = text.split("\n");

  let cantidadProductos = 0;
  let cantidadTotal = 0;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();

    if (linea.match(/^\d{12,13}$/)) {
      cantidadProductos++;
    }

    if (linea.match(/^\d+(\.\d+)?$/)) {
      const cantidad = parseFloat(linea);
      const lineaAnterior = lineas[i + 1]?.trim();
      if (lineaAnterior && lineaAnterior.match(/^\d{8}$/)) {
        cantidadTotal += cantidad;
      }
    }
  }

  const productos = [];
  const regex =
    /^([^\n]+)\s*\n\s*\n\s*XBX\s*\n\s*\d+\s*\n\s*\n\s*(\d+\.?\d*)\s*\n\s*\d+\s*\n\s*\n\s*[\d,]+\.?\d*\s*\n\s*\n\s*[\d,]+\.?\d*\s*\n\s*(\d+)/gm;
  let match;
  while ((match = regex.exec(text)) !== null) {
    productos.push({
      codigo: parseInt(match[3]),

      descripcion: match[1]?.trim() || `Producto ${match[1]}`,
      cantidad: parseInt(match[2]) || 0,
      marca: marca,
    });
  }
  console.log(productos);

  return {
    pedidoNo,
    fecha,
    cantidadProductos,
    cantidadTotal,
    marca,
    productos,
    rawText: text,
  };
};

const parseCon = (text) => {
  const pedidoMatch = text.match(/\s*\n*\n(\d{10})/);
  const fechaMatch = text.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/);
  const totalMatch = text.match(/Total[\s\n\$]*([\d,]+\.\d{2})/);
  const marcaMatch = text.match(/CON ALIMENTOS/i);

  const pedidoNo = pedidoMatch ? pedidoMatch[1] : null;
  const fecha = fechaMatch ? fechaMatch[1] : null;
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null;
  const marca = marcaMatch ? marcaMatch[0] : null;

  const lineas = text.split("\n");

  let cantidadProductos = 0;
  let cantidadTotal = 0;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();

    if (/XBX/i.test(linea)) {
      cantidadProductos++;
    }

    if (/(\b\d+\b).*\bCJ\b|\bCJ\b.*(\b\d+\b)/.test(linea)) {
      const match = linea.match(/\b\d+\b/);
      if (match) {
        const cantidad = parseInt(match[0]);
        cantidadTotal = cantidad;
      }
    }
  }

  const productos = [];
  const regex =
    /\n(\d{3,4})\n\s*(\d{10,13})\n\s*(\d{8,10})\n([\s\S]+?)\n\s*XBX\n\s*(\d+)\sCJ/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    productos.push({
      codigo: parseInt(match[1]),
      descripcion: match[4]?.trim() || `Producto ${match[1]}`,
      cantidad: parseInt(match[5]),
      marca: marca,
    });
  }
  console.log(productos);

  return {
    pedidoNo,
    fecha,
    cantidadProductos,
    cantidadTotal,
    marca,
    productos,
    rawText: text,
  };
};

const parseCrasa = (text) => {
  const normalizeText = (str) => {
    return str.replace(/\s+/g, " ").trim();
  };

  const pedidoMatch = text.match(/Pedido\s+No\s*(\d+)/i);
  const fechaMatch = text.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/);
  const totalMatch = text.match(/Total\s*[\$]?\s*([\d,]+\.\d{2})/i);
  const marcaMatch = text.match(/CRASA/i);

  const pedidoNo = pedidoMatch ? pedidoMatch[1] : null;
  const fecha = fechaMatch ? fechaMatch[1] : null;
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null;
  const marca = marcaMatch ? marcaMatch[0] : null;

  const productos = [];

  const palabrasProhibidas = [
    "INFORMACION BANCARIA",
    "Tipo de moneda",
    "Serie",
    "RFC",
    "Referencia",
    "Folio",
    "Uso del",
    "UUID",
  ];

  const regexProhibido = new RegExp(`^(${palabrasProhibidas.join("|")})`, "i");

  const lineas = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];

    const patron1 = linea.match(/^C?(\d{3,7})\s*-\s*(.+)$/);
    if (patron1) {
      const codigo = parseInt(patron1[1]);
      let descripcion = patron1[2].trim();

      let j = i + 1;
      while (j < lineas.length) {
        const siguienteLinea = lineas[j];

        if (
          siguienteLinea.match(/^\d+%$/) ||
          siguienteLinea.match(/^[\d,]+\.\d+$/) ||
          siguienteLinea.match(/^[\d.]+\s+Kg$/) ||
          siguienteLinea.match(/^\d{8}$/) ||
          siguienteLinea === "Caj XBX" ||
          siguienteLinea.match(/^C?\d{3,7}/) ||
          siguienteLinea.includes("Obj. Imp:")
        ) {
          break;
        }

        if (siguienteLinea && siguienteLinea !== "-") {
          descripcion += " " + siguienteLinea;
        }

        j++;

        if (j > i + 3) break;
      }

      descripcion = descripcion
        .replace(/\s*0%.*$/, "")
        .replace(/\s*[\d,]+\.\d+.*$/, "")
        .replace(/\s*\d+\.\d+\s+Kg.*$/, "")
        .replace(/\s*\d{8}.*$/, "")
        .trim();

      const cantidad = buscarCantidad(lineas, i);

      if (
        !descripcion ||
        /^\d/.test(descripcion) ||
        regexProhibido.test(descripcion)
      ) {
        continue;
      }

      productos.push({
        codigo: codigo,
        descripcion: normalizeText(descripcion),
        cantidad: cantidad,
        marca: "CRASA",
      });
      continue;
    }

    const patron2 = linea.match(/^C?(\d{3,7})$/);
    if (patron2) {
      const codigo = parseInt(patron2[1]);

      const descripcion = construirDescripcion(lineas, i + 1);
      const cantidad = buscarCantidad(lineas, i);

      if (
        !descripcion ||
        /^\d/.test(descripcion) ||
        regexProhibido.test(descripcion)
      ) {
        continue;
      }

      productos.push({
        codigo: codigo,
        descripcion: normalizeText(descripcion),
        cantidad: cantidad,
        marca: "CRASA",
      });
    }
  }

  function construirDescripcion(lineas, indiceInicio) {
    const partes = [];

    for (
      let j = indiceInicio;
      j < Math.min(indiceInicio + 10, lineas.length);
      j++
    ) {
      const lineaDesc = lineas[j];

      if (
        lineaDesc.match(/^\d+%$/) ||
        lineaDesc.match(/^[\d,]+\.\d+$/) ||
        lineaDesc.match(/^[\d.]+\s+Kg$/) ||
        lineaDesc.match(/^\d{8}$/) ||
        lineaDesc === "Caj XBX" ||
        lineaDesc.match(/^C\d{4,5}/) ||
        lineaDesc.includes("Obj. Imp:")
      ) {
        break;
      }

      if (lineaDesc && lineaDesc !== "-") {
        partes.push(lineaDesc);
      }
    }

    return partes.join(" ");
  }

  function buscarCantidad(lineas, indiceProducto) {
    for (
      let k = indiceProducto;
      k < Math.min(indiceProducto + 20, lineas.length - 1);
      k++
    ) {
      if (lineas[k] === "Caj XBX") {
        const siguienteLinea = lineas[k + 1];
        if (siguienteLinea && siguienteLinea.match(/^\d+$/)) {
          return parseInt(siguienteLinea);
        }
      }
    }
    return 1;
  }

  const productosUnicos = productos
    .filter(
      (producto, index, self) =>
        index === self.findIndex((p) => p.codigo === producto.codigo)
    )
    .sort((a, b) => a.codigo - b.codigo);

  const cantidadProductos = productosUnicos.length;
  console.log(productosUnicos);
  const cantidadTotal = productosUnicos.reduce((sum, p) => sum + p.cantidad, 0);

  console.log(`Productos extraídos: ${cantidadProductos}`);
  console.log(`Cantidad total: ${cantidadTotal}`);

  return {
    pedidoNo,
    fecha,
    cantidadProductos,
    cantidadTotal,
    marca,
    total,
    productos: productosUnicos,
    rawText: text,
  };
};

const parseCostena = (text) => {
  const pedidoMatch = text.match(/\s*\n*\s*(\d{10})/);
  const fechaMatch = text.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/);
  const totalMatch = text.match(/Total[\s\n\$]*([\d,]+\.\d{2})/);
  const marcaMatch = "LA COSTEÑA";

  const pedidoNo = pedidoMatch ? pedidoMatch[1] : null;
  const fecha = fechaMatch ? fechaMatch[1] : null;
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null;
  const marca = marcaMatch;

  const totalesMatch = text.match(/TOTALES\s*\n\s*([\d,]+)/i);
  let cantidadTotal = 0;
  if (totalesMatch) {
    const numeroSinComas = totalesMatch[1].replace(/,/g, "");
    cantidadTotal = parseInt(numeroSinComas, 10);
  }

  const lineas = text.split("\n");

  let cantidadProductos = 0;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();

    if (linea.match(/^XBX/)) {
      cantidadProductos++;
    }
  }

  const productos = [];
  const regex =
    /\n(\d{3,4})\n\s*(\d{10,13})\n\s*(\d{8,10})\n\s*(.+)\n\s*(.+)\n\s*(\d{1,5})/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    productos.push({
      codigo: parseInt(match[1]),
      descripcion: match[4]?.trim() || `Producto ${match[1]}`,
      cantidad: parseInt(match[6]) || 0,
      marca: marca,
    });
  }
  console.log(productos);

  return {
    pedidoNo,
    fecha,
    cantidadProductos,
    cantidadTotal,
    marca,
    productos,
    rawText: text,
  };
};
