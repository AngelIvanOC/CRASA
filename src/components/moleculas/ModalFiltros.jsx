import styled from "styled-components";
import { useState, useEffect } from "react";
import { supabase } from "../../index";
import { v } from "../../styles/variables";

export function ModalFiltros({
  isOpen,
  onClose,
  onApplyFilters,
  filtrosActivos,
}) {
  const [marcas, setMarcas] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState(
    filtrosActivos?.marca || ""
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      obtenerMarcas();
    }
  }, [isOpen]);

  useEffect(() => {
    setMarcaSeleccionada(filtrosActivos?.marca || "");
  }, [filtrosActivos]);

  const obtenerMarcas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("marcas")
        .select("id, nombre")
        .order("nombre", { ascending: true });

      if (error) throw error;
      setMarcas(data || []);
    } catch (error) {
      console.error("Error al obtener marcas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const filtros = {
      marca: marcaSeleccionada,
    };
    onApplyFilters(filtros);
    onClose();
  };

  const handleClearFilters = () => {
    setMarcaSeleccionada("");
    const filtrosVacios = {
      marca: "",
    };
    onApplyFilters(filtrosVacios);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>Filtros de Búsqueda</h3>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <LoadingText>Cargando marcas...</LoadingText>
          ) : (
            <FilterSection>
              <FilterLabel>Filtrar por Marca:</FilterLabel>
              <FilterSelect
                value={marcaSeleccionada}
                onChange={(e) => setMarcaSeleccionada(e.target.value)}
              >
                <option value="">Todas las marcas</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </FilterSelect>
            </FilterSection>
          )}
        </ModalBody>

        <ModalFooter>
          <SecondaryButton onClick={handleClearFilters}>
            Limpiar Filtros
          </SecondaryButton>
          <PrimaryButton onClick={handleApplyFilters} disabled={loading}>
            Aplicar Filtros
          </PrimaryButton>
        </ModalFooter>
      </ModalContent>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #374151;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const LoadingText = styled.p`
  text-align: center;
  color: #6b7280;
  margin: 20px 0;
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #374151;

  &:focus {
    outline: none;
    border-color: ${v.colorBotones || "#3b82f6"};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
`;

const SecondaryButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
`;

const PrimaryButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: ${v.colorBotones || "#3b82f6"};
  color: white;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${v.colorBotones ? `${v.colorBotones}dd` : "#2563eb"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
