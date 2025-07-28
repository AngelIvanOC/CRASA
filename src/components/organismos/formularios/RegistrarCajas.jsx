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
  const { guardarCaja } = useCajasStore();
  const [isPending, setIsPending] = useState(false);
  const { productoId } = useParams();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const { mutate: doGuardar } = useMutation({
    mutationFn: (dataForm) =>
      guardarCaja({ dataForm, accion, productoId, dataSelect }),
    mutationKey: ["guardar caja", accion, dataSelect?.id],
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
    setAccion(""); // limpia modo edición
    setdataSelect([]); // limpia datos seleccionados
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

      const { data: racksData } = await supabase
        .from("racks")
        .select("*")
        .eq("ocupado", false)
        .order("nivel", { ascending: true }) // A < B < C
        .order("lado", { ascending: true }) // 1 < 2
        .order("posicion", { ascending: true }); // 1 < 2 < ... < 40;

      // Ordenar por posición numéricamente ya que está guardado como text
      const racksOrdenados = racksData?.sort((a, b) => {
        // Primero por nivel
        if (a.nivel !== b.nivel) {
          return a.nivel.localeCompare(b.nivel);
        }
        // Luego por lado
        if (a.lado !== b.lado) {
          return parseInt(a.lado) - parseInt(b.lado);
        }
        // Finalmente por posición (convertir a número)
        return parseInt(a.posicion) - parseInt(b.posicion);
      });
      setRacks(racksOrdenados || []);
    }

    cargarDatos();
  }, [productoId]);

  useEffect(() => {
    if (accion === "Editar") {
      reset({
        cantidad: dataSelect?.cantidad || "",
        fecha_caducidad: dataSelect?.fecha_caducidad || "",
        rack_id: dataSelect?.rack_id || "",
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
                {accion === "Editar" ? "Editar Caja" : "Registrar nueva Caja"}
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

              <article>
                <InputText icono={<v.iconoFlechabajo />}>
                  <select
                    className="form__field"
                    {...register("rack_id", {
                      valueAsNumber: true,
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

    .formulario {
      .form-subcontainer {
        gap: 20px;
        display: flex;
        flex-direction: column;
      }
    }
  }
`;
