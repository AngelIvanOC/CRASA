import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import styled from "styled-components";

export function CardPedidosFecha({ data, loading }) {
  // Formatear datos para el gráfico
  const chartData = data.map((item) => ({
    mes: item.mes,
    pedidos: item.cantidad,
  }));

  return (
    <Container>
      <section className="content">
        {/* Header con título */}
        <div className="header">
          <h2>Pedidos/AñoAndy</h2>
        </div>

        {loading ? (
          <div className="loading">
            <p>Cargando...</p>
          </div>
        ) : data.length > 0 ? (
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  height={20}
                  tick={{ fontSize: 12, fill: "#9291a5" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={20}
                  tick={{ fontSize: 12, fill: "#9291a5" }}
                  domain={[0, "dataMax"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [value, "Pedidos"]}
                  labelStyle={{ color: "#333" }}
                />
                <Line
                  type="monotone"
                  dataKey="pedidos"
                  stroke="#023E8A"
                  strokeWidth={3}
                  dot={{ fill: "#fff", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: "#023E8A" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="empty">
            <p>No hay datos de pedidos disponibles</p>
          </div>
        )}
      </section>
    </Container>
  );
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.bgtotal};
  border-radius: 10px;
  height: 100%;
  box-shadow: -4px 0px 4px -2px rgba(0, 0, 0, 0.25),
    2px 2px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 0 10px;

  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px 0;
    box-sizing: border-box;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    h2 {
      display: inline-block;
      margin: 0;
      padding: 0;
      font-size: 18px;
      font-weight: 600;
      img {
        width: 20px;
      }
    }
  }

  .loading,
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;

    p {
      color: #9291a5;
      font-size: 12px;
      margin: 0;
    }
  }

  .loading p {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const ChartContainer = styled.div`
  flex-grow: 1;
  :focus {
    display: none;
  }

  .recharts-wrapper {
    .recharts-cartesian-grid-horizontal line,
    .recharts-cartesian-grid-vertical line {
      stroke: #f0f0f0;
    }
  }
`;
