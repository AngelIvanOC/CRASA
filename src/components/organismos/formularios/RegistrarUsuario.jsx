import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, supabase } from "../../../index";
import { Btnsave, useUsuariosStore, UsuarioForm } from "../../../index";
import { v } from "../../../styles/variables";

export function RegistrarUsuario({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarUsuario, editarUsuario, crearUsuarioCompleto } =
    useUsuariosStore();
  const [isPending, setIsPending] = useState(false);
  const [roles, setRoles] = useState([]);
  const queryClient = useQueryClient();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  // Mutation para insertar
  const { mutate: doInsertar } = useMutation({
    mutationFn: insertarUsuario,
    mutationKey: "insertar usuario",
    onError: (err) => {
      console.error("Error al insertar usuario:", err);
      setIsPending(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar todos usuarios"]);
      cerrarFormulario();
      setIsPending(false);
    },
  });

  // Mutation para editar
  const { mutate: doEditar } = useMutation({
    mutationFn: editarUsuario,
    mutationKey: "editar usuario",
    onError: (err) => {
      console.error("Error al editar usuario:", err);
      setIsPending(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar todos usuarios"]);
      cerrarFormulario();
      setIsPending(false);
    },
  });

  const handlesub = (data) => {
    setIsPending(true);

    if (accion === "Editar") {
      const usuarioData = {
        ...data,
        id: dataSelect.id,
        fecharegistro: dataSelect.fecharegistro,
      };
      doEditar(usuarioData);
    } else {
      // Para nuevo usuario, usar la función completa
      doCrearCompleto(data);
    }
  };

  const { mutate: doCrearCompleto } = useMutation({
    mutationFn: crearUsuarioCompleto, // del store
    mutationKey: "crear usuario completo",
    onError: (err) => {
      console.error("Error al crear usuario:", err);
      setIsPending(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar todos usuarios"]);
      cerrarFormulario();
      setIsPending(false);
    },
  });

  const cerrarFormulario = () => {
    onClose();
    if (setIsExploding) setIsExploding(true);
  };

  // Cargar tipos de roles
  useEffect(() => {
    async function cargarDatos() {
      const [rolesData] = await Promise.all([
        supabase.from("roles").select("*").order("nombre"),
      ]);

      setRoles(rolesData.data || []);
    }
    cargarDatos();
  }, []);

  // Reset form when editing
  useEffect(() => {
    if (accion === "Editar") {
      reset({
        nombres: dataSelect.nombres || "",
        telefono: dataSelect.telefono || "",
        correo: dataSelect.correo || "",
        direccion: dataSelect.direccion || "",
        id_rol: dataSelect.id_rol || "",
        estado: dataSelect.estado || "ACTIVO",
      });
    } else {
      reset({
        nombres: "",
        telefono: "",
        correo: "",
        direccion: "",
        id_rol: "",
        estado: "ACTIVO",
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
                {accion === "Editar"
                  ? "Editar usuario"
                  : "Registrar nuevo usuario"}
              </h1>
            </section>
            <section>
              <span onClick={onClose}>x</span>
            </section>
          </div>

          <form className="formulario" onSubmit={handleSubmit(handlesub)}>
            <UsuarioForm
              register={register}
              errors={errors}
              roles={roles}
              dataSelect={dataSelect}
              accion={accion}
            />

            <Btnsave
              icono={<v.iconoguardar />}
              titulo="Guardar"
              bgcolor={v.colorBotones}
            />
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
    padding: 20px;
    z-index: 100;
    max-height: 90vh;
    overflow-y: auto;

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
