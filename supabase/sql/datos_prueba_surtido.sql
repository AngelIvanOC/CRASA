-- Datos de prueba para ver el botón "Surtir" funcionando en CRASA sin tener
-- inventario real todavía. Correr DESPUÉS de surtir_pedido.sql (necesita las
-- funciones/columnas ya existentes, aunque en realidad solo usa tablas base).
--
-- Crea 1 marca + 4 productos, cada uno pensado para un escenario distinto:
--   A: se cubre completo solo con PISO
--   B: piso insuficiente, se completa con SUELTO
--   C: piso y suelto insuficientes, se completa con CAJAS/RACKS
--      (la caja queda exactamente en 0 -> el rack se debe liberar solo)
--   D: no alcanza en ningún lado -> queda "incompleto" con faltante
-- y 1 venta con código TEST-SURTIR-001 con un detalle_venta por producto.
--
-- Todo lo de prueba usa codigo_barras/codigo/nombre con prefijo "TEST" para
-- poder identificarlo y borrarlo fácil (ver bloque de limpieza al final).

DO $$
DECLARE
  v_marca_id bigint;
  v_prod_a   bigint;
  v_prod_b   bigint;
  v_prod_c   bigint;
  v_prod_d   bigint;
  v_rack_id  bigint;
  v_venta_id bigint;
BEGIN
  INSERT INTO marcas (nombre, logo)
  VALUES ('Marca Prueba (surtido)', '-')
  RETURNING id INTO v_marca_id;

  -- A: 15 en piso, se pide 15 -> se cubre 100% solo con piso
  INSERT INTO productos (codigo, nombre, marca_id, cajas, cantidad)
  VALUES (90001, 'Producto Prueba A - solo piso', v_marca_id, 0, 0)
  RETURNING id INTO v_prod_a;
  INSERT INTO piso (producto_id, cantidad, fecha_caducidad, codigo_barras)
  VALUES (v_prod_a, 15, CURRENT_DATE + 30, 'TESTA-PISO-1');

  -- B: 5 en piso + 10 en suelto, se piden 15 -> agota piso y se completa con suelto
  INSERT INTO productos (codigo, nombre, marca_id, cajas, cantidad)
  VALUES (90002, 'Producto Prueba B - piso + suelto', v_marca_id, 0, 0)
  RETURNING id INTO v_prod_b;
  INSERT INTO piso (producto_id, cantidad, fecha_caducidad, codigo_barras)
  VALUES (v_prod_b, 5, CURRENT_DATE + 10, 'TESTB-PISO-1');
  INSERT INTO suelto (producto_id, cantidad, fecha_caducidad, codigo_barras)
  VALUES (v_prod_b, 10, CURRENT_DATE + 60, 'TESTB-SUELTO-1');

  -- C: 2 en piso + 3 en suelto + 15 en una caja de rack, se piden 20 ->
  -- agota piso y suelto (5) y toma los 15 restantes de la caja, que queda
  -- en 0 -> el rack asociado debe liberarse (ocupado = false) automáticamente.
  INSERT INTO productos (codigo, nombre, marca_id, cajas, cantidad)
  VALUES (90003, 'Producto Prueba C - racks', v_marca_id, 0, 0)
  RETURNING id INTO v_prod_c;
  INSERT INTO piso (producto_id, cantidad, fecha_caducidad, codigo_barras)
  VALUES (v_prod_c, 2, CURRENT_DATE + 5, 'TESTC-PISO-1');
  INSERT INTO suelto (producto_id, cantidad, fecha_caducidad, codigo_barras)
  VALUES (v_prod_c, 3, CURRENT_DATE + 20, 'TESTC-SUELTO-1');
  INSERT INTO racks (marca_id, nivel, posicion, lado, ocupado, codigo_rack)
  VALUES (v_marca_id, 'A', '1', '1', true, 'TESTC-RACK-1')
  RETURNING id INTO v_rack_id;
  INSERT INTO cajas (producto_id, cantidad, fecha_caducidad, rack_id, codigo_barras)
  VALUES (v_prod_c, 15, CURRENT_DATE + 90, v_rack_id, 'TESTC-CAJA-1');

  -- D: solo 3 en piso, se piden 10 -> queda incompleto, faltan 7
  INSERT INTO productos (codigo, nombre, marca_id, cajas, cantidad)
  VALUES (90004, 'Producto Prueba D - sin stock suficiente', v_marca_id, 0, 0)
  RETURNING id INTO v_prod_d;
  INSERT INTO piso (producto_id, cantidad, fecha_caducidad, codigo_barras)
  VALUES (v_prod_d, 3, CURRENT_DATE + 15, 'TESTD-PISO-1');

  -- Sincroniza productos.cantidad/cajas con el stock recién insertado
  UPDATE productos p
  SET cantidad = COALESCE(agg.total_cantidad, 0),
      cajas    = COALESCE(agg.total_lotes, 0)
  FROM (
    SELECT producto_id,
           SUM(cantidad) AS total_cantidad,
           COUNT(*) FILTER (WHERE cantidad > 0) AS total_lotes
    FROM (
      SELECT producto_id, cantidad FROM piso WHERE producto_id IN (v_prod_a, v_prod_b, v_prod_c, v_prod_d)
      UNION ALL
      SELECT producto_id, cantidad FROM suelto WHERE producto_id IN (v_prod_a, v_prod_b, v_prod_c, v_prod_d)
      UNION ALL
      SELECT producto_id, cantidad FROM cajas WHERE producto_id IN (v_prod_a, v_prod_b, v_prod_c, v_prod_d)
    ) todo
    GROUP BY producto_id
  ) agg
  WHERE agg.producto_id = p.id;

  -- Venta de prueba con sus 4 productos pendientes de surtir
  INSERT INTO ventas (marca_id, cantidad_productos, cantidad_total, fecha, codigo, estado)
  VALUES (v_marca_id, 4, 4, now(), 'TEST-SURTIR-001', 'incompleto')
  RETURNING id INTO v_venta_id;

  INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, ubicacion, estado, escaneado)
  VALUES
    (v_venta_id, v_prod_a, 15, 'Almacen', 'incompleto', 0),
    (v_venta_id, v_prod_b, 15, 'Almacen', 'incompleto', 0),
    (v_venta_id, v_prod_c, 20, 'Almacen', 'incompleto', 0),
    (v_venta_id, v_prod_d, 10, 'Almacen', 'incompleto', 0);

  RAISE NOTICE 'Venta de prueba creada: id=%, codigo=TEST-SURTIR-001', v_venta_id;
END $$;

-- =========================================================
-- LIMPIEZA: correr esto aparte cuando ya no necesites los datos de prueba
-- (déjalo comentado, descoméntalo solo cuando quieras borrar)
-- =========================================================
-- DELETE FROM detalle_ventas WHERE venta_id IN (SELECT id FROM ventas WHERE codigo = 'TEST-SURTIR-001');
-- DELETE FROM ventas WHERE codigo = 'TEST-SURTIR-001';
-- DELETE FROM cajas WHERE codigo_barras LIKE 'TEST%';
-- DELETE FROM suelto WHERE codigo_barras LIKE 'TEST%';
-- DELETE FROM piso WHERE codigo_barras LIKE 'TEST%';
-- DELETE FROM racks WHERE codigo_rack LIKE 'TEST%';
-- DELETE FROM productos WHERE codigo IN (90001, 90002, 90003, 90004);
-- DELETE FROM marcas WHERE nombre = 'Marca Prueba (surtido)';
