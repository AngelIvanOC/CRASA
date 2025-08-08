import { useState, useEffect } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText, Btnsave, Spinner } from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../index";
import { useVentasStore } from "../../../index";

export function AsignarResponsable({
  onClose,
  ventaId,
  responsableActual,
  ayudantesActuales = [],
  onEquipoAsignado,
}) {
  const { editarVenta } = useVentasStore();
  const [isPending, setIsPending] = useState(false);
  const [responsables, setResponsables] = useState([]);
  const [ayudantes, setAyudantes] = useState([]);
  const [ayudantesSeleccionados, setAyudantesSeleccionados] =
    useState(ayudantesActuales);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const responsableSeleccionado = watch("usuario_id");

  useEffect(() => {
    async function cargarUsuarios() {
      const { data: responsablesData } = await supabase
        .from("usuarios")
        .select("id, nombres, id_auth")
        .eq("id_rol", 2)
        .eq("estado", "ACTIVO")
        .order("nombres", { ascending: true });

      const { data: ayudantesData } = await supabase
        .from("usuarios")
        .select("id, nombres, id_auth")
        .eq("id_rol", 5)
        .eq("estado", "ACTIVO")
        .order("nombres", { ascending: true });

      setResponsables(responsablesData || []);
      setAyudantes(ayudantesData || []);

      if (responsableActual) {
        setValue("usuario_id", responsableActual.id_auth);
      }
    }

    cargarUsuarios();
  }, [responsableActual, setValue]);

  useEffect(() => {
    async function cargarAyudantesExistentes() {
      if (ventaId) {
        const { data } = await supabase
          .from("ayudantes_venta")
          .select(
            `
            usuario_id,
            usuarios(id, nombres, id_auth)
          `
          )
          .eq("venta_id", ventaId);

        if (data) {
          setAyudantesSeleccionados(
            data.map((item) => ({
              id_auth: item.usuario_id,
              nombres: item.usuarios.nombres,
            }))
          );
        }
      }
    }

    cargarAyudantesExistentes();
  }, [ventaId]);

  const agregarAyudante = (ayudanteId) => {
    const ayudante = ayudantes.find((a) => a.id_auth === ayudanteId);
    if (
      ayudante &&
      !ayudantesSeleccionados.find((a) => a.id_auth === ayudanteId)
    ) {
      setAyudantesSeleccionados([...ayudantesSeleccionados, ayudante]);
    }
  };

  const removerAyudante = (ayudanteId) => {
    setAyudantesSeleccionados(
      ayudantesSeleccionados.filter((a) => a.id_auth !== ayudanteId)
    );
  };

  const ayudantesDisponibles = ayudantes.filter(
    (ayudante) =>
      ayudante.id_auth !== responsableSeleccionado &&
      !ayudantesSeleccionados.find((a) => a.id_auth === ayudante.id_auth)
  );

  const { mutate: doAsignarEquipo } = useMutation({
    mutationFn: async (data) => {
      const ventaResult = await editarVenta({
        id: ventaId,
        usuario: data.usuario_id,
      });

      await supabase.from("ayudantes_venta").delete().eq("venta_id", ventaId);

      if (ayudantesSeleccionados.length > 0) {
        const ayudantesData = ayudantesSeleccionados.map((ayudante) => ({
          venta_id: ventaId,
          usuario_id: ayudante.id_auth,
        }));

        await supabase.from("ayudantes_venta").insert(ayudantesData);
      }

      const responsableSeleccionadoData = responsables.find(
        (r) => r.id_auth === data.usuario_id
      );

      return {
        ventaResult,
        nuevoResponsable: responsableSeleccionadoData,
        nuevosAyudantes: ayudantesSeleccionados,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["mostrar ventas"]);
      queryClient.invalidateQueries(["detalle venta", ventaId]);

      const ayudantesFormateados = ayudantesSeleccionados.map((ayudante) => ({
        usuario_id: ayudante.id_auth,
        usuarios: {
          nombres: ayudante.nombres,
        },
      }));

      if (onEquipoAsignado) {
        onEquipoAsignado(data.nuevoResponsable, ayudantesFormateados);
      }

      onClose();
      setIsPending(false);
    },
    onError: (error) => {
      console.error("Error asignando equipo:", error);
      setIsPending(false);
    },
  });

  const onSubmit = (data) => {
    setIsPending(true);
    doAsignarEquipo(data);
  };

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>Asignar Equipo de Trabajo</h1>
            </section>
            <section>
              <span onClick={onClose}>×</span>
            </section>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <section className="form-subcontainer">
              <div className="seccion">
                <h3>Responsable Principal</h3>
                <article>
                  <InputText>
                    <select
                      {...register("usuario_id", { required: true })}
                      className="form__field"
                    >
                      <option value="">Seleccione un responsable</option>
                      {responsables.map((responsable) => (
                        <option
                          key={responsable.id}
                          value={responsable.id_auth}
                        >
                          {responsable.nombres}
                        </option>
                      ))}
                    </select>
                    <label className="form__label">Responsable</label>
                    {errors.usuario_id && <p>Campo requerido</p>}
                  </InputText>
                </article>
              </div>

              <div className="seccion">
                <h3>Ayudantes</h3>

                <div className="agregar-ayudante">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        agregarAyudante(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="select-ayudante"
                  >
                    <option value="">Seleccionar ayudante</option>
                    {ayudantesDisponibles.map((ayudante) => (
                      <option key={ayudante.id} value={ayudante.id_auth}>
                        {ayudante.nombres}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ayudantes-lista">
                  {ayudantesSeleccionados.map((ayudante) => (
                    <div key={ayudante.id_auth} className="ayudante-item">
                      <span>{ayudante.nombres}</span>
                      <button
                        type="button"
                        onClick={() => removerAyudante(ayudante.id_auth)}
                        className="btn-remover"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {ayudantesSeleccionados.length === 0 && (
                    <p className="sin-ayudantes">No hay ayudantes asignados</p>
                  )}
                </div>
              </div>

              <Btnsave
                titulo="Asignar Equipo"
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
    width: 600px;
    max-width: 90%;
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

    .form-subcontainer {
      gap: 25px;
      display: flex;
      flex-direction: column;

      .seccion {
        border: 1px solid ${({ theme }) => theme.borde || "#ddd"};
        border-radius: 8px;
        padding: 20px;

        h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 600;
          color: ${({ theme }) => theme.text};
        }
      }

      .agregar-ayudante {
        margin-bottom: 15px;

        .select-ayudante {
          width: 100%;
          padding: 10px;
          border: 1px solid ${({ theme }) => theme.borde || "#ddd"};
          border-radius: 5px;
          font-size: 14px;
        }
      }

      .ayudantes-lista {
        max-height: 200px;
        overflow-y: auto;

        .ayudante-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          margin-bottom: 5px;
          background: ${({ theme }) => theme.bgSecundario || "#f5f5f5"};
          border-radius: 5px;

          span {
            font-size: 14px;
          }

          .btn-remover {
            background: #ff4757;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
              background: #ff3742;
            }
          }
        }

        .sin-ayudantes {
          color: ${({ theme }) => theme.textSecundario || "#666"};
          font-style: italic;
          text-align: center;
          padding: 20px;
        }
      }
    }
  }
`;
