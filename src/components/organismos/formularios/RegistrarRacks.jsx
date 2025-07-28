import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btnsave,
  useRacksStore,
  Icono,
  ConvertirCapitalize,
  Spinner, // ✅ Agregar Spinner
} from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // ✅ Agregar useQueryClient
import { supabase } from "../../../index";

export function RegistrarRacks({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarRack, editarRack } = useRacksStore();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient(); // ✅ Agregar queryClient

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  // ✅ Mutation para insertar
  const { mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: "insertar racks",
    onError: (err) => {
      console.error("Error al insertar rack:", err); // ✅ Cambiar a console.error
      setIsPending(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar racks"]); // ✅ Invalidar queries
      cerrarFormulario();
      setIsPending(false);
    },
  });

  // ✅ Mutation para editar
  const { mutate: doEditar } = useMutation({
    mutationFn: editar,
    mutationKey: "editar rack",
    onError: (err) => {
      console.error("Error al editar rack:", err);
      setIsPending(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar racks"]); // ✅ Invalidar queries
      cerrarFormulario();
      setIsPending(false);
    },
  });

  const handlesub = (data) => {
    setIsPending(true);

    if (accion === "Editar") {
      const rackData = {
        ...data,
        id: dataSelect.id,
      };
      doEditar(rackData); // ✅ Usar doEditar
    } else {
      doInsertar(data);
    }
  };

  const cerrarFormulario = () => {
    onClose();
    if (setIsExploding) setIsExploding(true); // ✅ Agregar verificación
  };

  async function insertar(data) {
    const rack = {
      marca_id: data.marca_id || null,
      codigo_rack: data.codigo_rack,
      nivel: data.nivel,
      posicion: data.posicion,
      lado: data.lado,
    };

    await insertarRack(rack);
  }

  // ✅ Función separada para editar
  async function editar(data) {
    const rack = {
      id: data.id,
      marca_id: data.marca_id || null,
      codigo_rack: data.codigo_rack,
      nivel: data.nivel,
      posicion: data.posicion,
      lado: data.lado,
    };

    await editarRack(rack);
  }

  const [marcas, setMarcas] = useState([]);

  useEffect(() => {
    async function cargarMarcas() {
      const { data } = await supabase.from("marcas").select("*");
      setMarcas(data);
    }
    cargarMarcas();
  }, []);

  useEffect(() => {
    if (accion === "Editar") {
      reset({
        marca_id: dataSelect.marca_id || "",
        codigo_rack: dataSelect.codigo_rack,
        nivel: dataSelect.nivel,
        posicion: dataSelect.posicion,
        lado: dataSelect.lado,
      });
    } else {
      reset({
        marca_id: "",
        codigo_rack: "",
        nivel: "",
        posicion: "",
        lado: "",
      });
    }
  }, [accion, dataSelect, reset]);

  return (
    <Container>
      {isPending ? (
        <Spinner /> // ✅ Usar componente Spinner
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>
                {accion === "Editar" ? "Editar rack" : "Registrar nuevo rack"}{" "}
                {/* ✅ Cambiar == por === */}
              </h1>
            </section>

            <section>
              <span onClick={onClose}>x</span>
            </section>
          </div>

          <form className="formulario" onSubmit={handleSubmit(handlesub)}>
            <section className="form-subcontainer">
              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <input
                    className="form__field"
                    type="text"
                    placeholder="Codigo"
                    {...register("codigo_rack", {
                      required: true,
                    })}
                  />
                  <label className="form__label">Codigo</label>
                  {errors.codigo_rack?.type === "required" && (
                    <p>Campo requerido</p>
                  )}
                </InputText>
              </article>

              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <input
                    className="form__field"
                    type="text"
                    placeholder="Nivel"
                    {...register("nivel", {
                      required: true,
                    })}
                  />
                  <label className="form__label">Nivel</label>
                  {errors.nivel?.type === "required" && <p>Campo requerido</p>}
                </InputText>
              </article>

              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <input
                    className="form__field"
                    type="number"
                    placeholder="Lado"
                    {...register("lado")}
                  />
                  <label className="form__label">Lado</label>
                </InputText>
              </article>

              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <input
                    className="form__field"
                    type="number"
                    placeholder="Posicion"
                    {...register("posicion")}
                  />
                  <label className="form__label">Posicion</label>
                </InputText>
              </article>

              <Btnsave
                icono={<v.iconoguardar />}
                titulo="Guardar"
                bgcolor={v.colorBotones}
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
