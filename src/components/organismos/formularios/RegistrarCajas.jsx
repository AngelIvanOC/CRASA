// RegistrarCajas.js - Formulario actualizado

import { useEffect, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText, Btnsave, Spinner } from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../index";
import { useCajasStore } from "../../../store/useCajasStore";
import { useParams } from "react-router-dom";

export function RegistrarCajas({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
  refreshCajas,
  setAccion,
  setdataSelect,
}) {
  const { guardarRegistro } = useCajasStore();
  const [isPending, setIsPending] = useState(false);
  const [tipoRegistro, setTipoRegistro] = useState("caja");
  const { productoId } = useParams();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const { mutate: doGuardar } = useMutation({
    mutationFn: (dataForm) =>
      guardarRegistro({
        dataForm,
        accion,
        productoId,
        dataSelect,
        tipoRegistro,
      }),
    mutationKey: ["guardar registro", accion, dataSelect?.id, tipoRegistro],
    onError: (err) => {
      console.log("Error:", err.message);
      setIsPending(false);
    },
    onSuccess: () => {
      setIsPending(false);
      setIsExploding(true);
      refreshCajas();
      setTimeout(() => cerrarFormulario(), 1000);
    },
  });

  const handlesub = (data) => {
    setIsPending(true);
    doGuardar(data);
  };

  const cerrarFormulario = () => {
    onClose();
    setIsExploding(true);
    setAccion("");
    setdataSelect([]);
    setTipoRegistro("caja");
  };

  const [producto, setProducto] = useState(null);
  const [racks, setRacks] = useState([]);

  useEffect(() => {
    async function cargarDatos() {
      const { data: productoData } = await supabase
        .from("productos")
        .select("marca_id")
        .eq("id", productoId)
        .single();

      setProducto(productoData);

      // Construir la consulta de racks
      let query = supabase.from("racks").select("*");

      // Si está editando y tiene rack_id, incluir ese rack aunque esté ocupado
      if (accion === "Editar" && dataSelect?.rack_id) {
        query = query.or(`ocupado.eq.false,id.eq.${dataSelect.rack_id}`);
      } else {
        query = query.eq("ocupado", false);
      }

      const { data: racksData } = await query
        .order("nivel", { ascending: true })
        .order("lado", { ascending: true })
        .order("posicion", { ascending: true });

      const racksOrdenados = racksData?.sort((a, b) => {
        if (a.nivel !== b.nivel) {
          return a.nivel.localeCompare(b.nivel);
        }
        if (a.lado !== b.lado) {
          return parseInt(a.lado) - parseInt(b.lado);
        }
        return parseInt(a.posicion) - parseInt(b.posicion);
      });
      setRacks(racksOrdenados || []);
    }

    cargarDatos();
  }, [productoId, accion, dataSelect]);

  useEffect(() => {
    if (accion === "Editar" && dataSelect) {
      // Establecer el tipo de registro basado en los datos seleccionados
      setTipoRegistro(dataSelect.tipo || "caja");

      reset({
        cantidad: dataSelect?.cantidad || "",
        fecha_caducidad: dataSelect?.fecha_caducidad || "",
        rack_id: dataSelect?.rack_id ? String(dataSelect.rack_id) : "", // Convertir a string para el select
        codigo_barras: dataSelect?.codigo_barras || "",
      });
    } else {
      reset({
        cantidad: "",
        fecha_caducidad: "",
        rack_id: "",
        codigo_barras: "",
      });
    }
  }, [accion, dataSelect, reset, racks]); // Agregar racks como dependencia

  const getTitulo = () => {
    const tipoTexto =
      tipoRegistro === "caja"
        ? "Caja"
        : tipoRegistro === "suelto"
        ? "Registro Suelto"
        : "Registro de Piso";

    return accion === "Editar"
      ? `Editar ${tipoTexto}`
      : `Registrar nuevo ${tipoTexto}`;
  };

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>{getTitulo()}</h1>
            </section>
            <section>
              <span onClick={onClose}>x</span>
            </section>
          </div>

          {/* Selector de tipo de registro - solo mostrar si no está editando */}
          {accion !== "Editar" && (
            <div className="tipo-selector">
              <h3>Tipo de registro:</h3>
              <div className="tipo-buttons">
                <button
                  type="button"
                  className={tipoRegistro === "caja" ? "active" : ""}
                  onClick={() => setTipoRegistro("caja")}
                >
                  CAJA
                </button>
                <button
                  type="button"
                  className={tipoRegistro === "suelto" ? "active" : ""}
                  onClick={() => setTipoRegistro("suelto")}
                >
                  SUELTO
                </button>
                <button
                  type="button"
                  className={tipoRegistro === "piso" ? "active" : ""}
                  onClick={() => setTipoRegistro("piso")}
                >
                  EN PISO
                </button>
              </div>
            </div>
          )}

          <form className="formulario" onSubmit={handleSubmit(handlesub)}>
            <section className="form-subcontainer">
              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <input
                    className="form__field"
                    type="number"
                    placeholder="Cantidad"
                    {...register("cantidad", { required: true })}
                  />
                  <label className="form__label">Cantidad</label>
                  {errors.cantidad && <p>Campo requerido</p>}
                </InputText>
              </article>

              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <input
                    className="form__field"
                    type="date"
                    {...register("fecha_caducidad")}
                  />
                  <label className="form__label">Fecha de caducidad</label>
                </InputText>
              </article>

              {/* Solo mostrar selector de rack si es tipo "caja" */}
              {(tipoRegistro === "caja" ||
                (accion === "Editar" && dataSelect?.tipo === "caja")) && (
                <article>
                  <InputText icono={<v.iconoFlechabajo />}>
                    <select
                      className="form__field"
                      {...register("rack_id", {
                        required: false,
                      })}
                    >
                      <option value="">Seleccione un rack</option>
                      {racks.map((rack) => (
                        <option key={rack.id} value={rack.id}>
                          {rack.codigo_rack}
                        </option>
                      ))}
                    </select>
                    <label className="form__label">Rack</label>
                    {errors.rack_id && <p>Campo requerido</p>}
                  </InputText>
                </article>
              )}

              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <input
                    className="form__field"
                    type="text"
                    placeholder="Código de barras"
                    {...register("codigo_barras")}
                  />
                  <label className="form__label">Código de barras</label>
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

    .tipo-selector {
      margin-bottom: 20px;

      h3 {
        font-size: 16px;
        margin-bottom: 10px;
        color: ${({ theme }) => theme.textsecundario};
      }

      .tipo-buttons {
        display: flex;
        gap: 10px;

        button {
          flex: 1;
          padding: 10px 15px;
          border: 2px solid ${({ theme }) => theme.bgtotalFuerte};
          background: ${({ theme }) => theme.bgtotal};
          color: ${({ theme }) => theme.textsecundario};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;

          &:hover {
            border-color: ${v.colorBotones};
            color: ${v.colorBotones};
          }

          &.active {
            background: ${v.colorBotones};
            border-color: ${v.colorBotones};
            color: white;
          }
        }
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
