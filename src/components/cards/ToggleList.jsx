import styled from "styled-components";

export function ToggleList({ items, onChange }) {
  return (
    <ToggleContainer>
      {items.map((item, index) => (
        <ToggleItem key={index}>
          <ToggleLabel>{item.label}</ToggleLabel>
          <ToggleSwitch>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => onChange(item.key, e.target.checked)}
            />
            <Slider />
          </ToggleSwitch>
        </ToggleItem>
      ))}
    </ToggleContainer>
  );
}

const ToggleContainer = styled.div`
  margin-top: 15px;
`;

const ToggleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.bg2 || "#e5e5e5"};

  &:last-child {
    border-bottom: none;
  }
`;

const ToggleLabel = styled.span`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text || "#333"};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + & {
    background-color: #2196f3;
  }

  input:checked + &:before {
    transform: translateX(26px);
  }
`;
