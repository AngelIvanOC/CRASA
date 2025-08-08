const parseJumex = (text) => {
  console.log(text);
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

  return {
    pedidoNo,
    fecha,
    cantidadProductos,
    cantidadTotal,
    marca,
    rawText: text,
  };
};

const parseCon = (text) => {
  console.log("texto extraido", text);
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

  return {
    pedidoNo,
    fecha,
    cantidadProductos,
    cantidadTotal,
    marca,
    rawText: text,
  };
};

const parseCrasa = (text) => {
  const pedidoMatch = text.match(/Pedido No[\s\n]*(\d+)/i);
  const fechaMatch = text.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/);
  const totalMatch = text.match(/Total[\s\n\$]*([\d,]+\.\d{2})/);
  const marcaMatch = text.match(/CRASA/i);

  const pedidoNo = pedidoMatch ? pedidoMatch[1] : null;
  const fecha = fechaMatch ? fechaMatch[1] : null;
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null;
  const marca = marcaMatch ? marcaMatch[0] : null;

  const lineas = text.split("\n");

  let cantidadProductos = 0;
  let cantidadTotal = 0;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();

    if (linea.match(/^C\d{4}/)) {
      cantidadProductos++;
    }

    if (linea.match(/^\d+$/)) {
      const cantidad = parseInt(linea);
      const lineaAnterior = lineas[i - 1]?.trim();
      if (lineaAnterior && lineaAnterior.includes("Caj")) {
        cantidadTotal += cantidad;
      }
    }
  }

  return {
    pedidoNo,
    fecha,
    cantidadProductos,
    cantidadTotal,
    marca,
    rawText: text,
  };
};
