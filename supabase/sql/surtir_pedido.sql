-- Surtido de pedidos desde la web (CRASA), con fallback piso -> suelto -> cajas.
-- Correr manualmente en el SQL Editor de Supabase (proyecto tgftzyihxjojnnbmlecn).
-- Orden: 0) reconciliación una sola vez, 1) helper de estado, 2) núcleo por detalle,
-- 3) wrapper por venta completa, 4) grants.

-- =========================================================
-- 0) Reconciliación one-shot: productos.cantidad/cajas a partir del stock real
-- =========================================================
UPDATE productos p
SET cantidad = COALESCE(agg.total_cantidad, 0),
    cajas    = COALESCE(agg.total_lotes, 0)
FROM (
  SELECT producto_id,
         SUM(cantidad) AS total_cantidad,
         COUNT(*) FILTER (WHERE cantidad > 0) AS total_lotes
  FROM (
    SELECT producto_id, cantidad FROM piso
    UNION ALL
    SELECT producto_id, cantidad FROM suelto
    UNION ALL
    SELECT producto_id, cantidad FROM cajas
  ) todo
  GROUP BY producto_id
) agg
WHERE agg.producto_id = p.id;

-- =========================================================
-- 1) Helper: recalcula ventas.estado a partir de sus detalle_ventas
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_recalcular_estado_venta(p_venta_id bigint)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total       int;
  v_completados int;
  v_tocados     int;
  v_nuevo       text;
  v_actual      text;
BEGIN
  SELECT estado INTO v_actual FROM ventas WHERE id = p_venta_id FOR UPDATE;

  IF v_actual = 'Devolucion' THEN
    RETURN v_actual;
  END IF;

  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE estado = 'completado'),
    COUNT(*) FILTER (WHERE estado IN ('completado', 'en_progreso'))
  INTO v_total, v_completados, v_tocados
  FROM detalle_ventas
  WHERE venta_id = p_venta_id;

  v_nuevo := CASE
    WHEN v_total = 0 THEN COALESCE(v_actual, 'incompleto')
    WHEN v_completados = v_total THEN 'completado'
    WHEN v_completados > 0 OR v_tocados > 0 THEN 'en_progreso'
    ELSE 'incompleto'
  END;

  UPDATE ventas SET estado = v_nuevo WHERE id = p_venta_id;
  RETURN v_nuevo;
END;
$$;

-- =========================================================
-- 2) Núcleo: surte UN detalle_venta (un producto de un pedido)
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_surtir_detalle_venta(p_detalle_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_detalle          detalle_ventas%ROWTYPE;
  v_producto_codigo  bigint;
  v_producto_nombre  text;
  v_restante         numeric;
  v_total_restado    numeric := 0;
  v_piso_restado     numeric := 0;
  v_suelto_restado   numeric := 0;
  v_cajas_restado    numeric := 0;
  v_lotes_vaciados   int := 0;
  v_racks_afectados  bigint[] := '{}';
  v_movimientos      jsonb := '[]'::jsonb;
  lote               RECORD;
  v_take             numeric;
  v_nueva_cantidad   numeric;
  v_estado_detalle   text;
  v_escaneado_previo numeric;
BEGIN
  SELECT * INTO v_detalle FROM detalle_ventas WHERE id = p_detalle_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'detalle_venta % no existe', p_detalle_id;
  END IF;

  SELECT codigo, nombre INTO v_producto_codigo, v_producto_nombre
  FROM productos WHERE id = v_detalle.producto_id;

  v_escaneado_previo := COALESCE(v_detalle.escaneado, 0);

  IF v_detalle.estado = 'completado' THEN
    RETURN jsonb_build_object(
      'detalle_venta_id', v_detalle.id,
      'producto_id', v_detalle.producto_id,
      'producto_codigo', v_producto_codigo,
      'producto_nombre', v_producto_nombre,
      'cantidad_requerida', v_detalle.cantidad,
      'cantidad_surtida_ahora', 0,
      'cantidad_total_cubierta', v_escaneado_previo,
      'cantidad_faltante', 0,
      'estado_detalle', v_detalle.estado,
      'movimientos', '[]'::jsonb,
      'ya_estaba_completo', true
    );
  END IF;

  v_restante := GREATEST(0, v_detalle.cantidad - v_escaneado_previo);

  -- 1) PISO
  IF v_restante > 0 THEN
    FOR lote IN
      SELECT id, cantidad, codigo_barras FROM piso
      WHERE producto_id = v_detalle.producto_id AND cantidad > 0
      ORDER BY fecha_caducidad ASC, id ASC
      FOR UPDATE
    LOOP
      EXIT WHEN v_restante <= 0;
      v_take := LEAST(lote.cantidad, v_restante);
      v_nueva_cantidad := lote.cantidad - v_take;
      UPDATE piso SET cantidad = v_nueva_cantidad WHERE id = lote.id;
      v_restante := v_restante - v_take;
      v_total_restado := v_total_restado + v_take;
      v_piso_restado := v_piso_restado + v_take;
      v_movimientos := v_movimientos || jsonb_build_array(jsonb_build_object(
        'origen', 'piso', 'cantidad', v_take, 'codigo_barras', lote.codigo_barras, 'rack', NULL
      ));
      IF v_nueva_cantidad = 0 THEN v_lotes_vaciados := v_lotes_vaciados + 1; END IF;
    END LOOP;
  END IF;

  -- 2) SUELTO
  IF v_restante > 0 THEN
    FOR lote IN
      SELECT id, cantidad, codigo_barras FROM suelto
      WHERE producto_id = v_detalle.producto_id AND cantidad > 0
      ORDER BY fecha_caducidad ASC, id ASC
      FOR UPDATE
    LOOP
      EXIT WHEN v_restante <= 0;
      v_take := LEAST(lote.cantidad, v_restante);
      v_nueva_cantidad := lote.cantidad - v_take;
      UPDATE suelto SET cantidad = v_nueva_cantidad WHERE id = lote.id;
      v_restante := v_restante - v_take;
      v_total_restado := v_total_restado + v_take;
      v_suelto_restado := v_suelto_restado + v_take;
      v_movimientos := v_movimientos || jsonb_build_array(jsonb_build_object(
        'origen', 'suelto', 'cantidad', v_take, 'codigo_barras', lote.codigo_barras, 'rack', NULL
      ));
      IF v_nueva_cantidad = 0 THEN v_lotes_vaciados := v_lotes_vaciados + 1; END IF;
    END LOOP;
  END IF;

  -- 3) CAJAS (en racks)
  IF v_restante > 0 THEN
    FOR lote IN
      SELECT c.id, c.cantidad, c.rack_id, c.codigo_barras, r.codigo_rack
      FROM cajas c
      LEFT JOIN racks r ON r.id = c.rack_id
      WHERE c.producto_id = v_detalle.producto_id AND c.cantidad > 0
      ORDER BY c.fecha_caducidad ASC, c.id ASC
      FOR UPDATE OF c
    LOOP
      EXIT WHEN v_restante <= 0;
      v_take := LEAST(lote.cantidad, v_restante);
      v_nueva_cantidad := lote.cantidad - v_take;
      UPDATE cajas SET cantidad = v_nueva_cantidad WHERE id = lote.id;
      v_restante := v_restante - v_take;
      v_total_restado := v_total_restado + v_take;
      v_cajas_restado := v_cajas_restado + v_take;
      v_movimientos := v_movimientos || jsonb_build_array(jsonb_build_object(
        'origen', 'cajas', 'cantidad', v_take, 'codigo_barras', lote.codigo_barras, 'rack', lote.codigo_rack
      ));
      IF v_nueva_cantidad = 0 THEN
        v_lotes_vaciados := v_lotes_vaciados + 1;
        IF lote.rack_id IS NOT NULL THEN
          v_racks_afectados := array_append(v_racks_afectados, lote.rack_id);
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- Liberar racks cuya última caja con stock se vacio
  IF array_length(v_racks_afectados, 1) IS NOT NULL THEN
    UPDATE racks r
    SET ocupado = false
    WHERE r.id = ANY(v_racks_afectados)
      AND NOT EXISTS (SELECT 1 FROM cajas c WHERE c.rack_id = r.id AND c.cantidad > 0);
  END IF;

  -- Persistir agregados en productos (a diferencia del bug en movil)
  IF v_total_restado > 0 OR v_lotes_vaciados > 0 THEN
    UPDATE productos
    SET cantidad = GREATEST(0, cantidad - v_total_restado),
        cajas    = GREATEST(0, cajas - v_lotes_vaciados)
    WHERE id = v_detalle.producto_id;
  END IF;

  v_estado_detalle := CASE
    WHEN (v_escaneado_previo + v_total_restado) >= v_detalle.cantidad THEN 'completado'
    WHEN (v_escaneado_previo + v_total_restado) > 0 THEN 'en_progreso'
    ELSE 'incompleto'
  END;

  UPDATE detalle_ventas
  SET escaneado = v_escaneado_previo + v_total_restado,
      estado = v_estado_detalle
  WHERE id = p_detalle_id;

  PERFORM fn_recalcular_estado_venta(v_detalle.venta_id);

  RETURN jsonb_build_object(
    'detalle_venta_id', p_detalle_id,
    'producto_id', v_detalle.producto_id,
    'producto_codigo', v_producto_codigo,
    'producto_nombre', v_producto_nombre,
    'cantidad_requerida', v_detalle.cantidad,
    'cantidad_surtida_ahora', v_total_restado,
    'cantidad_total_cubierta', v_escaneado_previo + v_total_restado,
    'cantidad_faltante', GREATEST(0, v_detalle.cantidad - (v_escaneado_previo + v_total_restado)),
    'estado_detalle', v_estado_detalle,
    'desglose_origen', jsonb_build_object(
      'piso', v_piso_restado, 'suelto', v_suelto_restado, 'cajas', v_cajas_restado
    ),
    'movimientos', v_movimientos,
    'ya_estaba_completo', false
  );
END;
$$;

-- =========================================================
-- 3) Wrapper: surte TODOS los detalle_ventas pendientes de un pedido
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_surtir_venta(p_venta_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_estado_venta text;
  v_detalle_id   bigint;
  v_resultado    jsonb;
  v_resultados   jsonb := '[]'::jsonb;
  v_completados  int := 0;
  v_total        int := 0;
BEGIN
  SELECT estado INTO v_estado_venta FROM ventas WHERE id = p_venta_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'venta % no existe', p_venta_id;
  END IF;
  IF v_estado_venta = 'Devolucion' THEN
    RAISE EXCEPTION 'No se puede surtir una venta marcada como Devolucion';
  END IF;

  FOR v_detalle_id IN
    SELECT id FROM detalle_ventas
    WHERE venta_id = p_venta_id AND estado IS DISTINCT FROM 'completado'
    ORDER BY id ASC
  LOOP
    v_resultado := fn_surtir_detalle_venta(v_detalle_id);
    v_resultados := v_resultados || jsonb_build_array(v_resultado);
    v_total := v_total + 1;
    IF (v_resultado ->> 'estado_detalle') = 'completado' THEN
      v_completados := v_completados + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'venta_id', p_venta_id,
    'estado_venta', (SELECT estado FROM ventas WHERE id = p_venta_id),
    'total_detalles_procesados', v_total,
    'completados', v_completados,
    'incompletos', v_total - v_completados,
    'detalle', v_resultados,
    'faltantes', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'detalle_venta_id', dv.id,
        'producto_id', dv.producto_id,
        'codigo', p.codigo,
        'nombre', p.nombre,
        'cantidad_requerida', dv.cantidad,
        'cantidad_cubierta', COALESCE(dv.escaneado, 0),
        'cantidad_faltante', dv.cantidad - COALESCE(dv.escaneado, 0)
      )), '[]'::jsonb)
      FROM detalle_ventas dv
      JOIN productos p ON p.id = dv.producto_id
      WHERE dv.venta_id = p_venta_id AND dv.estado IS DISTINCT FROM 'completado'
    )
  );
END;
$$;

-- =========================================================
-- 4) Grants
-- =========================================================
REVOKE ALL ON FUNCTION public.fn_surtir_detalle_venta(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_recalcular_estado_venta(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_surtir_venta(bigint) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.fn_surtir_detalle_venta(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_recalcular_estado_venta(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_surtir_venta(bigint) TO authenticated;
