export const parseInvoiceData = (text) => {
  if (/Con Alimentos S.A. de C.V./i.test(text)) return parseCon(text);
  if (/CRASA/i.test(text)) return parseCrasa(text);
  if (/JUMEX/i.test(text)) return parseJumex(text);
  if (/lacostena/i.test(text)) return parseCostena(text);

  console.warn("Formato de factura desconocido");
  return null;
};

const parseJumex = (text) => {
  console.log(text);
  const pedidoMatch = text.match(/Folio [\s\n]*(\d+)/i);
  const fechaMatch = text.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/);
  const totalMatch = text.match(/Total[\s\n\$]*([\d,]+\.\d{2})/);
  const marcaMatch = text.match(/JUMEX/i); // Puedes ampliar esto

  const pedidoNo = pedidoMatch ? pedidoMatch[1] : null;
  const fecha = fechaMatch ? fechaMatch[1] : null;
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null;
  const marca = marcaMatch ? marcaMatch[0] : null;

  const lineas = text.split("\n");

  let cantidadProductos = 0;
  let cantidadTotal = 0;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();

    // Identificar líneas que contienen descripción del producto
    if (linea.match(/^\d{12,13}$/)) {
      cantidadProductos++;
    }

    // Buscar líneas con números que representen la cantidad
    if (linea.match(/^\d+(\.\d+)?$/)) {
      const cantidad = parseFloat(linea);
      // Validar que está precedida por una línea tipo "Caj XBX"
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
      /*ean: match[2],
        nose: match[3],*/
      descripcion: match[1]?.trim() || `Producto ${match[1]}`,
      //sepa: match[5],
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
  console.log("texto extraido", text);
  const pedidoMatch = text.match(/\s*\n*\n(\d{10})/);
  const fechaMatch = text.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/);
  const totalMatch = text.match(/Total[\s\n\$]*([\d,]+\.\d{2})/);
  const marcaMatch = text.match(/CON ALIMENTOS/i); // Puedes ampliar esto

  const pedidoNo = pedidoMatch ? pedidoMatch[1] : null;
  const fecha = fechaMatch ? fechaMatch[1] : null;
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null;
  const marca = marcaMatch ? marcaMatch[0] : null;

  const lineas = text.split("\n");

  let cantidadProductos = 0;
  let cantidadTotal = 0;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();

    // Identificar líneas que contienen descripción del producto
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
      /*ean: match[2],
        nose: match[3],*/
      descripcion: match[4]?.trim() || `Producto ${match[1]}`,
      //sepa: match[5],
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

  // Extraer información básica
  const pedidoMatch = text.match(/Pedido\s+No\s*(\d+)/i);
  const fechaMatch = text.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/);
  const totalMatch = text.match(/Total\s*[\$]?\s*([\d,]+\.\d{2})/i);
  const marcaMatch = text.match(/CRASA/i);

  const pedidoNo = pedidoMatch ? pedidoMatch[1] : null;
  const fecha = fechaMatch ? fechaMatch[1] : null;
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null;
  const marca = marcaMatch ? marcaMatch[0] : null;

  const productos = [];

  // Dividir en líneas y limpiar
  const lineas = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];

    // Patrón 1: C#### - DESCRIPCION (puede continuar en líneas siguientes)
    const patron1 = linea.match(/^C(\d{4,5})\s*-\s*(.+)$/);
    if (patron1) {
      const codigo = parseInt(patron1[1]);
      let descripcion = patron1[2].trim();

      // Verificar si la descripción continúa en líneas siguientes
      let j = i + 1;
      while (j < lineas.length) {
        const siguienteLinea = lineas[j];

        // Parar si encontramos indicadores de fin de descripción
        if (
          siguienteLinea.match(/^\d+%$/) || // Solo porcentaje
          siguienteLinea.match(/^[\d,]+\.\d+$/) || // Solo precio
          siguienteLinea.match(/^[\d.]+\s+Kg$/) || // Peso
          siguienteLinea.match(/^\d{8}$/) || // Código SAT
          siguienteLinea === "Caj XBX" || // Indicador cantidad
          siguienteLinea.match(/^C\d{4,5}/) || // Siguiente producto
          siguienteLinea.includes("Obj. Imp:") // Objeto impuesto
        ) {
          break;
        }

        // Si la línea parece ser continuación de descripción, agregarla
        if (siguienteLinea && siguienteLinea !== "-") {
          descripcion += " " + siguienteLinea;
        }

        j++;

        // Límite de seguridad - máximo 3 líneas adicionales
        if (j > i + 3) break;
      }

      // Limpiar la descripción eliminando datos que no son parte del nombre
      descripcion = descripcion
        .replace(/\s*0%.*$/, "") // Quitar porcentaje y todo lo que sigue
        .replace(/\s*[\d,]+\.\d+.*$/, "") // Quitar precios
        .replace(/\s*\d+\.\d+\s+Kg.*$/, "") // Quitar peso
        .replace(/\s*\d{8}.*$/, "") // Quitar códigos SAT
        .trim();

      const cantidad = buscarCantidad(lineas, i);

      productos.push({
        codigo: codigo,
        descripcion: normalizeText(descripcion),
        cantidad: cantidad,
        marca: "CRASA",
      });
      continue;
    }

    // Patrón 2: C#### solo (descripción en líneas siguientes)
    const patron2 = linea.match(/^C(\d{4,5})$/);
    if (patron2) {
      const codigo = parseInt(patron2[1]);

      // Recoger descripción de las siguientes líneas hasta encontrar un delimitador
      const descripcion = construirDescripcion(lineas, i + 1);
      const cantidad = buscarCantidad(lineas, i);

      productos.push({
        codigo: codigo,
        descripcion: normalizeText(descripcion),
        cantidad: cantidad,
        marca: "CRASA",
      });
    }
  }

  // Función para construir descripción multilínea
  function construirDescripcion(lineas, indiceInicio) {
    const partes = [];

    for (
      let j = indiceInicio;
      j < Math.min(indiceInicio + 10, lineas.length);
      j++
    ) {
      const lineaDesc = lineas[j];

      // Parar si encontramos indicadores de fin de descripción
      if (
        lineaDesc.match(/^\d+%$/) || // Solo porcentaje
        lineaDesc.match(/^[\d,]+\.\d+$/) || // Solo precio
        lineaDesc.match(/^[\d.]+\s+Kg$/) || // Peso
        lineaDesc.match(/^\d{8}$/) || // Código SAT
        lineaDesc === "Caj XBX" || // Indicador cantidad
        lineaDesc.match(/^C\d{4,5}/) || // Siguiente producto
        lineaDesc.includes("Obj. Imp:") // Objeto impuesto
      ) {
        break;
      }

      // Agregar líneas válidas (excluyendo solo guión)
      if (lineaDesc && lineaDesc !== "-") {
        partes.push(lineaDesc);
      }
    }

    return partes.join(" ");
  }

  // Función para buscar cantidad
  function buscarCantidad(lineas, indiceProducto) {
    // Buscar en las siguientes 20 líneas
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
    return 1; // Valor por defecto
  }

  // Eliminar duplicados y ordenar
  const productosUnicos = productos
    .filter(
      (producto, index, self) =>
        index === self.findIndex((p) => p.codigo === producto.codigo)
    )
    .sort((a, b) => a.codigo - b.codigo);

  const cantidadProductos = productosUnicos.length;
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
  console.log(text);

  const pedidoMatch = text.match(/\s*\n*\s*(\d{10})/);
  const fechaMatch = text.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/);
  const totalMatch = text.match(/Total[\s\n\$]*([\d,]+\.\d{2})/);
  const marcaMatch = "LA COSTEÑA"; // Puedes ampliar esto

  const pedidoNo = pedidoMatch ? pedidoMatch[1] : null;
  const fecha = fechaMatch ? fechaMatch[1] : null;
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null;
  const marca = marcaMatch;

  // Extraer número después de "TOTALES" que está en la siguiente línea (puede tener coma)
  const totalesMatch = text.match(/TOTALES\s*\n\s*([\d,]+)/i);
  let cantidadTotal = 0;
  if (totalesMatch) {
    // totalesMatch[1] es el número con comas, por ejemplo "1,860"
    const numeroSinComas = totalesMatch[1].replace(/,/g, "");
    cantidadTotal = parseInt(numeroSinComas, 10);
  }

  const lineas = text.split("\n");

  let cantidadProductos = 0;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();

    // Identificar líneas que contienen descripción del producto
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
      /*ean: match[2],
        nose: match[3],*/
      descripcion: match[4]?.trim() || `Producto ${match[1]}`,
      //sepa: match[5],
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
