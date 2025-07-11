import React from "react";
import { CardSmall } from "./CardSmall";
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
    <CardSmall
      titulo="Pedidos/Año"
      loading={loading}
      emptyMessage="No hay datos de pedidos disponibles"
    >
      {!loading && data.length > 0 && (
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9291a5" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9291a5" }}
                domain={[0, "dataMax + 1"]}
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
                strokeWidth={2}
                dot={{ fill: "#fff", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: "#023E8A" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </CardSmall>
  );
}

const ChartContainer = styled.div`
  height: 200px;
  width: 100%;
  margin-top: 10px;

  .recharts-wrapper {
    .recharts-cartesian-grid-horizontal line,
    .recharts-cartesian-grid-vertical line {
      stroke: #f0f0f0;
    }
  }
`;
