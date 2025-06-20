import styled from "styled-components";

export function NumberInput({ label, value, onChange, min, max }) {
  return (
    <InputContainer>
      <InputLabel>{label}</InputLabel>
      <StyledInput
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        min={min}
        max={max}
      />
    </InputContainer>
  );
}

const InputContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  margin-top: 15px;
`;

const InputLabel = styled.span`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text || "#333"};
`;

const StyledInput = styled.input`
  border: 1px solid ${({ theme }) => theme.bg2 || "#e5e5e5"};
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  width: 80px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;
