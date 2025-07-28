import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btnsave,
  useProductosStore,
  Icono,
  ConvertirCapitalize,
  Spinner,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../index";

export function RegistrarProductos({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarProductos, editarProducto } = useProductosStore();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const { mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: "insertar productos",
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
      codigo: data.codigo,
      nombre: ConvertirCapitalize(data.nombre),
      marca_id: data.marca_id || null, // Usa marca_id en lugar de marca
      cajas: data.cajas ? parseInt(data.cajas) : null,
      cantidad: data.cantidad ? parseInt(data.cantidad) : null,
      racks: data.racks || null,
    };

    if (accion === "Editar") {
      producto.id = dataSelect.id;
      await editarProducto(producto);
    } else {
      await insertarProductos(producto);
    }
  }

  const [marcas, setMarcas] = useState([]);

  const [racks, setRacks] = useState([]);

  useEffect(() => {
    async function cargarMarcas() {
      const { data } = await supabase.from("marcas").select("*");
      setMarcas(data);
    }
    cargarMarcas();

    async function cargarRacks() {
      const { data } = await supabase.from("racks").select("*");
      setRacks(data);
    }

    cargarRacks();
  }, []);

  useEffect(() => {
    console.log("Marcas cargadas:", marcas); // Verifica en consola
    console.log("Racis cargados:", racks); // Verifica en consola
  }, [marcas, racks]);

  useEffect(() => {
    console.log("Datos para editar:", dataSelect); // Verifica en consola
  }, [dataSelect]);

  useEffect(() => {
    if (accion === "Editar") {
      reset({
        codigo: dataSelect.codigo,
        nombre: dataSelect.nombre,
        marca_id: dataSelect.marca_id || "", // Usa marca_id
        cajas: dataSelect.cajas,
        cantidad: dataSelect.cantidad,
        racks: dataSelect.racks,
      });
    } else {
      reset({
        codigo: "",
        nombre: "",
        marca_id: "",
        cajas: "",
        cantidad: "",
        racks: "",
      });
    }
  }, [accion, dataSelect, reset]);

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>
                {accion == "Editar"
                  ? "Editar producto"
                  : "Registrar nuevo producto"}
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
                    placeholder="Código"
                    {...register("codigo", {
                      required: true,
                    })}
                  />
                  <label className="form__label">Código</label>
                  {errors.codigo?.type === "required" && <p>Campo requerido</p>}
                </InputText>
              </article>

              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <input
                    className="form__field"
                    type="text"
                    placeholder="Nombre"
                    {...register("nombre", {
                      required: true,
                    })}
                  />
                  <label className="form__label">Nombre</label>
                  {errors.nombre?.type === "required" && <p>Campo requerido</p>}
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
              {/** 

              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <input
                    className="form__field"
                    type="number"
                    placeholder="Cajas (opcional)"
                    {...register("cajas")}
                  />
                  <label className="form__label">Cajas</label>
                </InputText>
              </article>

              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <input
                    className="form__field"
                    type="number"
                    placeholder="Cantidad (opcional)"
                    {...register("cantidad")}
                  />
                  <label className="form__label">Cantidad</label>
                </InputText>
              </article>

              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <select
                    className="form__field"
                    {...register("racks", {
                      valueAsNumber: true,
                      required: false,
                    })}
                    defaultValue={dataSelect?.racks || ""}
                  >
                    <option value="">Seleccione una ubicacion</option>
                    {racks &&
                      racks.map((rack) => (
                        <option key={rack.id} value={rack.id}>
                          {rack.codigo_rack}
                        </option>
                      ))}
                  </select>
                  <label className="form__label">Rack</label>
                </InputText>
              </article>
*/}
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
