import { useEffect, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText, Btnsave, useUsuariosStore, Spinner } from "../../../index";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

export function EditarUsuario({ onClose, dataSelect, setIsExploding }) {
  const { editarUsuario } = useUsuariosStore();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const { mutate: doEditar } = useMutation({
    mutationFn: editarUsuario,
    mutationKey: "editar_usuario",
    onError: (err) => {
      console.log("Error al editar usuario:", err.message);
      setIsPending(false);
    },
    onSuccess: () => {
      cerrarFormulario();
      setIsPending(false);
    },
  });

  const handlesubmit = (data) => {
    setIsPending(true);
    doEditar({ ...data, id: dataSelect.id });
  };

  const cerrarFormulario = () => {
    onClose();
    setIsExploding(true);
  };

  useEffect(() => {
    if (dataSelect) {
      reset({
        nombres: dataSelect.nombres || "",
        correo: dataSelect.correo || "",
        telefono: dataSelect.telefono || "",
      });
    }
  }, [dataSelect, reset]);

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>Editar Usuario</h1>
            </section>
            <section>
              <span onClick={onClose}>x</span>
            </section>
          </div>

          <form className="formulario" onSubmit={handleSubmit(handlesubmit)}>
            <section className="form-subcontainer">
              <article>
                <InputText>
                  <input
                    className="form__field"
                    type="text"
                    placeholder="Nombres"
                    {...register("nombres", { required: true })}
                  />
                  <label className="form__label">Nombres</label>
                  {errors.nombres && <p>Campo requerido</p>}
                </InputText>
              </article>

              <article>
                <InputText>
                  <input
                    className="form__field"
                    type="email"
                    placeholder="Correo"
                    {...register("correo", { required: true })}
                  />
                  <label className="form__label">Correo</label>
                  {errors.correo && <p>Campo requerido</p>}
                </InputText>
              </article>

              <article>
                <InputText>
                  <input
                    className="form__field"
                    type="text"
                    placeholder="Teléfono"
                    {...register("telefono")}
                  />
                  <label className="form__label">Teléfono</label>
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(10, 9, 9, 0.5);

  .sub-contenedor {
    background-color: ${({ theme }) => theme.bg};
    padding: 20px;
    border-radius: 10px;
    width: 100%;
    max-width: 600px;
  }

  .headers {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      font-size: 22px;
    }

    span {
      cursor: pointer;
      font-size: 24px;
    }
  }

  .formulario {
    margin-top: 20px;
  }

  .form-subcontainer {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
  }

  p {
    color: red;
    font-size: 12px;
    margin: 0;
  }
`;
