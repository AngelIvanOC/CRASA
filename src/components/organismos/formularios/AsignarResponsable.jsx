import { useState, useEffect } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText, Btnsave, Spinner } from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../index";
import { useVentasStore } from "../../../index";

export function AsignarResponsable({ onClose, ventaId, responsableActual }) {
  const { editarVenta } = useVentasStore();
  const [isPending, setIsPending] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    async function cargarUsuarios() {
      const { data } = await supabase
        .from("usuarios")
        .select("id, nombres, id_auth")
        .order("nombres", { ascending: true });

      setUsuarios(data || []);

      // Establecer valor inicial si hay responsable actual
      if (responsableActual) {
        setValue("usuario_id", responsableActual.id_auth);
      }
    }

    cargarUsuarios();
  }, [responsableActual, setValue]);

  const { mutate: doAsignarResponsable } = useMutation({
    mutationFn: async (data) => {
      return await editarVenta({
        id: ventaId,
        usuario: data.usuario_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar ventas"]);
      queryClient.invalidateQueries(["detalle venta", ventaId]);
      onClose();
      setIsPending(false);
    },
    onError: (error) => {
      console.error("Error asignando responsable:", error);
      setIsPending(false);
    },
  });

  const onSubmit = (data) => {
    setIsPending(true);
    doAsignarResponsable(data);
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
                {responsableActual
                  ? "Cambiar Responsable"
                  : "Asignar Responsable"}
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
                    {...register("usuario_id", { required: true })}
                    className="form__field"
                  >
                    <option value="">Seleccione un responsable</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id_auth}>
                        {usuario.nombres}
                      </option>
                    ))}
                  </select>
                  <label className="form__label">Responsable</label>
                  {errors.usuario_id && <p>Campo requerido</p>}
                </InputText>
              </article>

              <Btnsave
                titulo={
                  responsableActual
                    ? "Actualizar Responsable"
                    : "Asignar Responsable"
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
