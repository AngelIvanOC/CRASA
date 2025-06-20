import { useEffect, useState } from "react";
import { useMarcasStore } from "../../../../store/MarcasStore";
import { BaseCard } from "../../../cards/BaseCard";
import { ActionList } from "../../../cards/ActionList";
import { v } from "../../../../styles/variables";

export function CardMarcas() {
  const [showModal, setShowModal] = useState(false);
  const { dataMarcas, mostrarMarcas } = useMarcasStore();

  useEffect(() => {
    mostrarMarcas();
  }, []);

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleEdit = (marca) => {
    console.log("Editar marca:", marca);
  };

  {
    /*const handleDelete = (marca) => {
    if (window.confirm("¿Estás seguro de eliminar esta marca?")) {
      eliminarMarca(marca.id);
    }
  };*/
  }

  const buttonConfig = {
    icono: <v.iconoagregar />,
    titulo: "Agregar Marca",
    bgcolor: "#2196F3",
    funcion: handleAdd,
    width: "100%",
  };

  return (
    <>
      <BaseCard
        titulo="Marcas Registradas"
        buttonConfig={buttonConfig}
        loading={!dataMarcas}
      >
        {dataMarcas && <ActionList items={dataMarcas} onEdit={handleEdit} />}
      </BaseCard>

      {showModal && <AgregarMarca onClose={() => setShowModal(false)} />}
    </>
  );
}
