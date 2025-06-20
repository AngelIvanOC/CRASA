import { useEffect, useState } from "react";
import { useUsuariosStore } from "../../../../store/UsuariosStore";
import { BaseCard } from "../../../cards/BaseCard";
import { StyledTable } from "../../../cards/StyledTable";
import { EditarUsuario } from "../../formularios/EditarUsuario";
import { v } from "../../../../styles/variables";

export function CardPersonal() {
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const { dataUsuarios, mostrarusuarios } = useUsuariosStore();

  useEffect(() => {
    mostrarusuarios();
  }, []);

  const handleEditClick = () => {
    setUsuarioEditar(dataUsuarios);
    setShowModal(true);
  };

  const tableFields = [
    { key: "nombres", label: "Nombre" },
    {
      key: "fecharegistro",
      label: "Creado",
      formatter: (date) =>
        date
          ? new Date(date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Sin fecha",
    },
    { key: "telefono", label: "Genero" },
    { key: "correo", label: "Email" },
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
        titulo="Información Personal"
        buttonConfig={buttonConfig}
        loading={!dataUsuarios}
      >
        {dataUsuarios && (
          <StyledTable data={dataUsuarios} fields={tableFields} />
        )}
      </BaseCard>

      {showModal && (
        <EditarUsuario
          onClose={() => setShowModal(false)}
          dataSelect={usuarioEditar}
          setIsExploding={() => {}}
        />
      )}
    </>
  );
}
