-- Limpieza: productos.cantidad quedó con datos residuales de la reconciliación
-- one-shot de surtir_pedido.sql (línea 9-25), que la llenó con el TOTAL de
-- piso+suelto+cajas en vez de "solo lo que hay en rack". El front-end ya no
-- lee esta columna para mostrar EN RACK/TOTAL (ahora se calcula en vivo desde
-- la tabla cajas), así que queda huérfana y se resetea a 0.
-- Correr manualmente en el SQL Editor de Supabase (proyecto tgftzyihxjojnnbmlecn).

UPDATE productos
SET cantidad = 0
WHERE cantidad IS DISTINCT FROM 0;
