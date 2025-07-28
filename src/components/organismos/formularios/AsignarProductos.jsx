import { useEffect, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText, Btnsave, Spinner } from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../index";
import { useVentasStore } from "../../../index";
export function AsignarProductos({
  onClose,
  marcaId,
  ventaId,
  dataSelect, // Datos del producto a editar
  accion, // 'Nuevo' o 'Editar'
}) {
  const { insertarProductosVenta, editarProductoVenta } = useVentasStore();
  const [isPending, setIsPending] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosAsignados, setProductosAsignados] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Cargar productos y productos ya asignados
  useEffect(() => {
    async function cargarDatos() {
      try {
        // 1. Obtener productos ya asignados a esta venta (excepto el que estamos editando)
        const { data: asignados } = await supabase
          .from("detalle_ventas")
          .select("producto_id")
          .eq("venta_id", ventaId)
          .neq("id", dataSelect?.id || 0); // Excluir el actual si estamos editando

        setProductosAsignados(asignados?.map((p) => p.producto_id) || []);

        // 2. Obtener productos de la marca que no estén ya asignados
        let query = supabase
          .from("productos")
          .select("id, codigo, nombre")
          .eq("marca_id", marcaId)
          .order("nombre", { ascending: true });

        if (asignados?.length > 0) {
          query = query.not(
            "id",
            "in",
            `(${asignados.map((p) => p.producto_id).join(",")})`
          );
        }

        const { data: productosData } = await query;

        setProductos(productosData || []);

        // Si estamos editando, establecer valores iniciales del formulario
        if (accion === "Editar" && dataSelect) {
          setValue("producto_id", dataSelect.producto_id);
          setValue("cantidad", dataSelect.cantidad);
          setValue(
            "fecha_caducidad",
            dataSelect.fecha_caducidad?.split("T")[0]
          );
          setValue("ubicacion", dataSelect.ubicacion);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    }

    if (marcaId && ventaId) {
      cargarDatos();
    }
  }, [marcaId, ventaId, dataSelect, accion, setValue]);

  const { mutate: doSave } = useMutation({
    mutationFn: async (data) => {
      const payload = {
        producto_id: data.producto_id,
        cantidad: parseInt(data.cantidad),
        fecha_caducidad: data.fecha_caducidad || null,
        ubicacion: data.ubicacion || null,
      };

      if (accion === "Editar" && dataSelect?.id) {
        return await editarProductoVenta(dataSelect.id, payload);
      } else {
        return await insertarProductosVenta(ventaId, [payload]);
      }
    },
    onSuccess: () => {
      onClose();
      setIsPending(false);
    },
    onError: (error) => {
      console.error("Error:", error);
      setIsPending(false);
    },
  });

  const onSubmit = (data) => {
    setIsPending(true);
    doSave(data);
  };

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>
                {accion === "Editar"
                  ? "Editar Producto"
                  : "Asignar Producto a Venta"}
              </h1>
            </section>
            <section>
              <span onClick={onClose}>×</span>
            </section>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <section className="form-subcontainer">
              <article>
                <InputText>
                  <select
                    {...register("producto_id", { required: true })}
                    className="form__field"
                    disabled={accion === "Editar"} // No permitir cambiar el producto en edición
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.codigo} - {producto.nombre}
                      </option>
                    ))}
                    {/* Mostrar el producto actual en edición aunque esté asignado */}
                    {accion === "Editar" && dataSelect?.producto && (
                      <option value={dataSelect.producto.id} selected>
                        {dataSelect.producto.codigo} -{" "}
                        {dataSelect.producto.nombre}
                      </option>
                    )}
                  </select>
                  <label className="form__label">Producto</label>
                  {errors.producto_id && <p>Campo requerido</p>}
                </InputText>
              </article>

              <article>
                <InputText>
                  <input
                    type="number"
                    {...register("cantidad", {
                      required: true,
                      min: 1,
                      valueAsNumber: true,
                    })}
                    className="form__field"
                    placeholder="Cantidad"
                  />
                  <label className="form__label">Cantidad</label>
                  {errors.cantidad && <p>Debe ser mayor a 0</p>}
                </InputText>
              </article>

              {/*<article>
                <InputText>
                  <input
                    type="date"
                    {...register("fecha_caducidad")}
                    className="form__field"
                  />
                  <label className="form__label">
                    Fecha de caducidad (opcional)
                  </label>
                </InputText>
              </article>*/}

              <Btnsave
                titulo={
                  accion === "Editar" ? "Guardar Cambios" : "Asignar Producto"
                }
                bgcolor={v.colorBotones}
                type="submit"
              />
            </section>
          </form>
        </div>
      )}
    </Container>
  );
}

// Mantén los mismos estilos del Container...

// Mantén los mismos estilos

const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .sub-contenedor {
    position: relative;
    width: 500px;
    max-width: 85%;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 13px 36px 20px 36px;
    z-index: 100;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 20px;
        font-weight: 500;
      }
      span {
        font-size: 20px;
        cursor: pointer;
      }
    }

    .formulario {
      .form-subcontainer {
        gap: 20px;
        display: flex;
        flex-direction: column;
      }
    }
  }
`;
