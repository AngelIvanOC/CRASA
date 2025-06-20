import styled from "styled-components";

export function ActionList({ items, onEdit, onDelete }) {
  return (
    <ListContainer>
      {items.map((item, index) => (
        <ListItem key={index}>
          <ItemName>{item.nombre || item.name}</ItemName>
          <Actions>
            <ActionButton onClick={() => onEdit(item)}>Editar</ActionButton>
            <ActionButton onClick={() => onDelete(item)}>Eliminar</ActionButton>
          </Actions>
        </ListItem>
      ))}
    </ListContainer>
  );
}

const ListContainer = styled.div`
  margin-top: 15px;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.bg2 || "#e5e5e5"};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.text || "#333"};
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text || "#333"};
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;

  &:hover {
    background-color: ${({ theme }) => theme.bg2 || "#f5f5f5"};
    border-radius: 4px;
  }
`;
