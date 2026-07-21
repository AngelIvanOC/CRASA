-- ============================================================
-- Limpieza de productos duplicados (mismo codigo + marca_id)
-- y bloqueo permanente de futuros duplicados.
--
-- Fuente de verdad para decidir que fila conservar: las tablas reales
-- de inventario (piso, suelto, cajas) y detalle_ventas (NO las columnas
-- productos.cajas / productos.cantidad, que son un campo huerfano que
-- ya no refleja el inventario real).
--
-- Paso 1: 17 casos donde AMBAS filas duplicadas tenian
--   inventario real en piso/suelto/cajas -> se fusiona el inventario
--   de la fila mas vieja hacia la mas nueva (UPDATE, no se pierde nada).
-- Paso 2: se borran las filas duplicadas que ya quedaron sin referencias
--   (las 17 recien fusionadas + las que ya no tenian ningun
--   registro real de por si).
-- Paso 3: se agrega el constraint UNIQUE(codigo, marca_id) para que
--   nunca mas se puedan crear duplicados.
--
-- Ejecutar UNA sola vez desde el SQL Editor de Supabase.
-- ============================================================

BEGIN;

-- Paso 1: fusionar inventario de los 17 casos con datos en ambos lados
-- codigo|marca 100042|2: conservar id 1754, fusionar id(s) 1085
UPDATE piso SET producto_id = 1754 WHERE producto_id IN (1085);
UPDATE suelto SET producto_id = 1754 WHERE producto_id IN (1085);
UPDATE cajas SET producto_id = 1754 WHERE producto_id IN (1085);

-- codigo|marca 100083|2: conservar id 1753, fusionar id(s) 1084
UPDATE piso SET producto_id = 1753 WHERE producto_id IN (1084);
UPDATE suelto SET producto_id = 1753 WHERE producto_id IN (1084);
UPDATE cajas SET producto_id = 1753 WHERE producto_id IN (1084);

-- codigo|marca 100092|2: conservar id 1739, fusionar id(s) 1557
UPDATE piso SET producto_id = 1739 WHERE producto_id IN (1557);
UPDATE suelto SET producto_id = 1739 WHERE producto_id IN (1557);
UPDATE cajas SET producto_id = 1739 WHERE producto_id IN (1557);

-- codigo|marca 100137|2: conservar id 1711, fusionar id(s) 1549
UPDATE piso SET producto_id = 1711 WHERE producto_id IN (1549);
UPDATE suelto SET producto_id = 1711 WHERE producto_id IN (1549);
UPDATE cajas SET producto_id = 1711 WHERE producto_id IN (1549);

-- codigo|marca 100162|2: conservar id 1715, fusionar id(s) 1550
UPDATE piso SET producto_id = 1715 WHERE producto_id IN (1550);
UPDATE suelto SET producto_id = 1715 WHERE producto_id IN (1550);
UPDATE cajas SET producto_id = 1715 WHERE producto_id IN (1550);

-- codigo|marca 100167|2: conservar id 1672, fusionar id(s) 1546
UPDATE piso SET producto_id = 1672 WHERE producto_id IN (1546);
UPDATE suelto SET producto_id = 1672 WHERE producto_id IN (1546);
UPDATE cajas SET producto_id = 1672 WHERE producto_id IN (1546);

-- codigo|marca 100314|2: conservar id 1732, fusionar id(s) 1094
UPDATE piso SET producto_id = 1732 WHERE producto_id IN (1094);
UPDATE suelto SET producto_id = 1732 WHERE producto_id IN (1094);
UPDATE cajas SET producto_id = 1732 WHERE producto_id IN (1094);

-- codigo|marca 100334|2: conservar id 1745, fusionar id(s) 1099
UPDATE piso SET producto_id = 1745 WHERE producto_id IN (1099);
UPDATE suelto SET producto_id = 1745 WHERE producto_id IN (1099);
UPDATE cajas SET producto_id = 1745 WHERE producto_id IN (1099);

-- codigo|marca 100335|2: conservar id 1758, fusionar id(s) 1607
UPDATE piso SET producto_id = 1758 WHERE producto_id IN (1607);
UPDATE suelto SET producto_id = 1758 WHERE producto_id IN (1607);
UPDATE cajas SET producto_id = 1758 WHERE producto_id IN (1607);

-- codigo|marca 100491|2: conservar id 1815, fusionar id(s) 1686
UPDATE piso SET producto_id = 1815 WHERE producto_id IN (1686);
UPDATE suelto SET producto_id = 1815 WHERE producto_id IN (1686);
UPDATE cajas SET producto_id = 1815 WHERE producto_id IN (1686);

-- codigo|marca 100502|2: conservar id 1663, fusionar id(s) 1078
UPDATE piso SET producto_id = 1663 WHERE producto_id IN (1078);
UPDATE suelto SET producto_id = 1663 WHERE producto_id IN (1078);
UPDATE cajas SET producto_id = 1663 WHERE producto_id IN (1078);

-- codigo|marca 100802|2: conservar id 1671, fusionar id(s) 1079
UPDATE piso SET producto_id = 1671 WHERE producto_id IN (1079);
UPDATE suelto SET producto_id = 1671 WHERE producto_id IN (1079);
UPDATE cajas SET producto_id = 1671 WHERE producto_id IN (1079);

-- codigo|marca 100805|2: conservar id 1673, fusionar id(s) 1547
UPDATE piso SET producto_id = 1673 WHERE producto_id IN (1547);
UPDATE suelto SET producto_id = 1673 WHERE producto_id IN (1547);
UPDATE cajas SET producto_id = 1673 WHERE producto_id IN (1547);

-- codigo|marca 100806|2: conservar id 1674, fusionar id(s) 1080
UPDATE piso SET producto_id = 1674 WHERE producto_id IN (1080);
UPDATE suelto SET producto_id = 1674 WHERE producto_id IN (1080);
UPDATE cajas SET producto_id = 1674 WHERE producto_id IN (1080);

-- codigo|marca 100814|2: conservar id 1675, fusionar id(s) 1097
UPDATE piso SET producto_id = 1675 WHERE producto_id IN (1097);
UPDATE suelto SET producto_id = 1675 WHERE producto_id IN (1097);
UPDATE cajas SET producto_id = 1675 WHERE producto_id IN (1097);

-- codigo|marca 900102|2: conservar id 1783, fusionar id(s) 1639
UPDATE piso SET producto_id = 1783 WHERE producto_id IN (1639);
UPDATE suelto SET producto_id = 1783 WHERE producto_id IN (1639);
UPDATE cajas SET producto_id = 1783 WHERE producto_id IN (1639);

-- codigo|marca 900104|2: conservar id 1785, fusionar id(s) 1641
UPDATE piso SET producto_id = 1785 WHERE producto_id IN (1641);
UPDATE suelto SET producto_id = 1785 WHERE producto_id IN (1641);
UPDATE cajas SET producto_id = 1785 WHERE producto_id IN (1641);

-- Paso 2: borrar las filas duplicadas (ya fusionadas o ya vacias)
DELETE FROM productos
WHERE id IN (
1095,
1755,
1756,
1713,
1683,
1277,
1709,
1710,
1687,
1083,
1716,
1717,
1551,
1098,
1668,
1282,
1736,
1737,
1666,
1693,
1694,
1695,
1696,
1697,
1698,
1699,
1700,
1704,
1689,
1690,
1691,
1692,
1104,
1801,
1731,
1733,
1757,
1728,
1729,
1730,
1743,
1742,
1744,
1705,
1090,
1775,
1776,
1778,
1303,
1304,
1724,
1727,
1772,
1308,
1767,
1768,
1771,
1769,
1770,
1749,
1750,
1751,
1805,
1806,
1807,
1808,
1313,
1682,
1684,
1719,
1720,
1721,
1722,
1723,
1556,
1740,
1317,
1495,
1318,
1741,
1707,
1748,
1746,
1747,
1603,
1788,
1625,
1790,
1629,
1082,
1792,
1793,
1794,
1795,
1784,
1786,
1655,
1810,
1034,
1085,
1084,
1557,
1549,
1550,
1546,
1094,
1099,
1607,
1686,
1078,
1079,
1547,
1080,
1097,
1639,
1641
);

-- Paso 3: bloquear duplicados futuros para siempre
ALTER TABLE productos
  ADD CONSTRAINT uq_productos_codigo_marca UNIQUE (codigo, marca_id);

COMMIT;
