import styled from "styled-components";
import { useComprasStore } from "../../index";
import { v } from "../../styles/variables";

export function DetalleCompraModal({ isOpen, onClose }) {
  const { detalleCompra } = useComprasStore();

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <h3>Detalle de Compra</h3>
          <button onClick={onClose}>×</button>
        </ModalHeader>

        <ModalBody>
          <table>
            <thead>
              <tr>
                <th># Producto</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Ubicación</th>
                <th>Fecha Caducidad</th>
              </tr>
            </thead>
            <tbody>
              {detalleCompra?.map((item) => (
                <tr key={item.id}>
                  <td>{item.productos?.codigo || "-"}</td>
                  <td>{item.productos?.nombre || "-"}</td>
                  <td>{item.cantidad || 0}</td>
                  <td>{item.ubicacion || "-"}</td>
                  <td>{item.fecha_caducidad || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
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

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;

  button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #ddd;
      text-align: left;
    }

    th {
      background-color: ${v.colorPrincipal};
      color: white;
      position: sticky;
      top: 0;
    }

    tr:hover {
      background-color: #f5f5f5;
    }
  }
`;
