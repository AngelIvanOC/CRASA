import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btnsave,
  useRacksStore,
  Icono,
  ConvertirCapitalize,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../index";

export function RegistrarRacks({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarRack, editarRack } = useRacksStore();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const { mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: "insertar racks",
    onError: (err) => {
      console.log("El error", err.message);
      setIsPending(false);
    },
    onSuccess: () => {
      cerrarFormulario();
      setIsPending(false);
    },
  });

  const handlesub = (data) => {
    setIsPending(true);
    doInsertar(data);
  };

  const cerrarFormulario = () => {
    onClose();
    setIsExploding(true);
  };

  async function insertar(data) {
    const producto = {
      marca_id: data.marca_id || null,
      codigo_rack: data.codigo_rack,
      nivel: data.nivel,
      posicion: data.posicion,
      lado: data.lado,
    };

    if (accion === "Editar") {
      producto.id = dataSelect.id;
      await editarRack(producto);
    } else {
      await insertarRack(producto);
    }
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
    console.log("Marcas cargadas:", marcas); // Verifica en consola
  }, [marcas]);

  useEffect(() => {
    console.log("Datos para editar:", dataSelect); // Verifica en consola
  }, [dataSelect]);

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
        <span>Cargando...</span>
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>
                {accion == "Editar" ? "Editar rack" : "Registrar nuevo rack"}
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
                  <select
                    className="form__field"
                    {...register("marca_id", {
                      valueAsNumber: true,
                      required: false,
                    })}
                    defaultValue={dataSelect?.marca_id || ""}
                  >
                    <option value="">Seleccione una marca</option>
                    {marcas &&
                      marcas.map((marca) => (
                        <option key={marca.id} value={marca.id}>
                          {marca.nombre}
                        </option>
                      ))}
                  </select>
                  <label className="form__label">Marca</label>
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
