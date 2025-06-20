import styled from "styled-components";

export function StyledTable({ data, fields }) {
  return (
    <TableContainer>
      <Table>
        <tbody>
          {fields.map(({ key, label, formatter }) => (
            <tr key={key}>
              <td className="label">{label}</td>
              <td className="value">
                {formatter ? formatter(data[key]) : data[key] || "Sin datos"}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}

const TableContainer = styled.div`
  margin-top: 15px;
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  tbody {
    tr {
      border-bottom: 1px solid ${({ theme }) => theme.bg2 || "#e5e5e5"};

      &:last-child {
        border-bottom: none;
      }

      td {
        padding: 12px 0;
        vertical-align: top;

        &.label {
          font-weight: 500;
          color: ${({ theme }) => theme.text || "#333"};
          width: 40%;
          font-size: 14px;
        }

        &.value {
          color: ${({ theme }) => theme.text || "#333"};
          font-weight: 600;
          text-align: right;
          font-size: 14px;
          word-break: break-word;
        }
      }
    }
  }
`;
