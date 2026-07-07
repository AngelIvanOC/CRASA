import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

const ETIQUETAS_ORIGEN = {
  piso: "Piso",
  suelto: "Suelto",
  cajas: "Rack",
};

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  titulo: { fontSize: 16, marginBottom: 4 },
  subtitulo: { fontSize: 10, marginBottom: 16, color: "#555555" },
  productoBox: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1 solid #dddddd",
  },
  productoHeader: { fontSize: 12, marginBottom: 4 },
  movimiento: { flexDirection: "row", justifyContent: "space-between" },
  faltante: { color: "#c0392b", marginTop: 4 },
  sinMovimientos: { color: "#888888", marginTop: 2 },
});

function OrdenSurtidoDocumento({ codigoPedido, fecha, productos }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titulo}>Orden de Surtido - Almacén</Text>
        <Text style={styles.subtitulo}>
          Pedido {codigoPedido || "-"} · {new Date(fecha || Date.now()).toLocaleString()}
        </Text>

        {productos.map((p, i) => (
          <View key={i} style={styles.productoBox}>
            <Text style={styles.productoHeader}>
              {p.producto_codigo} - {p.producto_nombre} (requeridos: {p.cantidad_requerida})
            </Text>

            {p.movimientos && p.movimientos.length > 0 ? (
              p.movimientos.map((m, j) => (
                <View key={j} style={styles.movimiento}>
                  <Text>
                    Tomar {m.cantidad} de {ETIQUETAS_ORIGEN[m.origen] || m.origen}
                    {m.rack ? ` (rack ${m.rack})` : ""}
                  </Text>
                  <Text>{m.codigo_barras || ""}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.sinMovimientos}>
                Sin inventario disponible para este producto.
              </Text>
            )}

            {p.cantidad_faltante > 0 && (
              <Text style={styles.faltante}>
                Faltan {p.cantidad_faltante} unidades (sin stock suficiente)
              </Text>
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function descargarOrdenSurtido({ codigoPedido, fecha, productos }) {
  if (!productos || productos.length === 0) return;

  const blob = await pdf(
    <OrdenSurtidoDocumento
      codigoPedido={codigoPedido}
      fecha={fecha}
      productos={productos}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orden-surtido-${codigoPedido || "pedido"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
