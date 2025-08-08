import { useEffect, useState } from "react";
import { useAuthStore } from "../../../../store/AuthStore";
import { BaseCard } from "../../../cards/BaseCard";
import { StyledTable } from "../../../cards/StyledTable";
import { EditarUsuario } from "../../formularios/EditarUsuario";
import { v } from "../../../../styles/variables";
import { supabase } from "../../../../index";
import Swal from "sweetalert2";

export function CardCuenta() {
  const [showModal, setShowModal] = useState(false);
  const [cuentaEditar, setCuentaEditar] = useState(null);
  const { dataCuenta, obtenerDatosCuenta } = useAuthStore();

  useEffect(() => {
    obtenerDatosCuenta();
  }, [obtenerDatosCuenta]);

  useEffect(() => {
    console.log("dataCuenta:", dataCuenta);
  }, [dataCuenta]);

  const cambiarContrasena = async () => {
    const { value: nuevaContrasena } = await Swal.fire({
      title: "Cambiar Contraseña",
      input: "password",
      inputLabel: "Nueva contraseña",
      inputPlaceholder: "Ingresa tu nueva contraseña",
      inputAttributes: {
        minlength: 6,
        autocomplete: "new-password",
      },
      showCancelButton: true,
      confirmButtonText: "Cambiar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value || value.length < 6) {
          return "La contraseña debe tener al menos 6 caracteres";
        }
      },
    });

    if (nuevaContrasena) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: nuevaContrasena,
        });

        if (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cambiar la contraseña: " + error.message,
          });
        } else {
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "Contraseña cambiada exitosamente",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error inesperado",
        });
      }
    }
  };

  const handleEditClick = () => {
    setCuentaEditar(dataCuenta);
    setShowModal(true);
  };

  const tableFields = [
    { key: "nombres", label: "Usuario" },
    { key: "correo", label: "Email" },
    {
      key: "id_rol",
      label: "Rol",
      formatter: (value) => {
        return value || "Sin rol asignado";
      },
    },
    {
      key: "password",
      label: "Contraseña",
      formatter: () => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>••••••••••</span>
          <button
            onClick={cambiarContrasena}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: v.colorBotones,
              fontSize: "16px",
            }}
            title="Cambiar contraseña"
          >
            🔑
          </button>
        </div>
      ),
    },
  ];

  const buttonConfig = {
    icono: <v.iconeditarTabla />,
    titulo: "Editar",
    bgcolor: v.colorBotones,
    funcion: handleEditClick,
    width: "100%",
  };

  return (
    <>
      <BaseCard
        titulo="Información de la Cuenta"
        buttonConfig={buttonConfig}
        loading={!dataCuenta}
      >
        {dataCuenta && <StyledTable data={dataCuenta} fields={tableFields} />}
      </BaseCard>

      {showModal && (
        <EditarUsuario
          onClose={() => setShowModal(false)}
          dataSelect={cuentaEditar}
          setIsExploding={() => {}}
        />
      )}
    </>
  );
}
