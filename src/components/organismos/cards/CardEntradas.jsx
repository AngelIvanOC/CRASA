import React from "react";
import { CardSmall } from "./CardSmall";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import styled from "styled-components";

const COLORS = [
  "#023E8A",
  "#0077B6",
  "#0096C7",
  "#00B4D8",
  "#48CAE4",
  "#90E0EF",
];

export function CardEntradas({ data, loading }) {
  const chartData = data?.data || [];
  const total = data?.total || 0;

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <TooltipContainer>
          <div className="tooltip-content">
            <div className="tooltip-header">
              <div
                className="tooltip-color"
                style={{ backgroundColor: payload[0].color }}
              />
              <span className="tooltip-name">{data.nombre}</span>
            </div>
            <div className="tooltip-value">{data.cantidad}</div>
          </div>
        </TooltipContainer>
      );
    }
    return null;
  };

  return (
    <CardSmall
      titulo="Entradas"
      loading={loading}
      emptyMessage="No hay entradas esta semana"
    >
      {!loading && chartData.length > 0 && (
        <PieContainer>
          <div className="pie-header">
            <span className="subtitle">Esta Semana</span>
            <span className="total">{total}</span>
          </div>

          <div className="pie-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="cantidad"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                      style={{
                        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PieContainer>
      )}
    </CardSmall>
  );
}

const PieContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 5px;

  .pie-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .subtitle {
      color: #9291a5;
      font-size: 12px;
    }

    .total {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
  }

  .pie-chart {
    height: 180px;
    flex: 1;
    position: relative;

    /* Efectos hover para las secciones del pie */
    .recharts-pie-sector:hover {
      opacity: 0.8;
      transform: scale(1.02);
      transition: all 0.2s ease;
    }
  }
`;

const TooltipContainer = styled.div`
  .tooltip-content {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);

    .tooltip-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;

      .tooltip-color {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .tooltip-name {
        font-size: 12px;
        font-weight: 500;
        color: #333;
      }
    }

    .tooltip-value {
      font-size: 14px;
      font-weight: bold;
      color: #2c3e50;
      text-align: center;
      padding: 2px 6px;
      background: #f8f9fa;
      border-radius: 4px;
    }
  }
`;
