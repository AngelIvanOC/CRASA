import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import styled from "styled-components";
import { Device } from "../../../styles/breakpoints";

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
    <Container>
      <section className="content">
        {/* Header con título */}
        <div className="header">
          <h2>Entradas</h2>
        </div>

        {loading ? (
          <div className="loading">
            <p>Cargando...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="chart-content">
            <div className="pie-header">
              <span className="subtitle">Esta Semana</span>
              <span className="total">{total}</span>
            </div>

            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="90%"
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
            </ChartContainer>
          </div>
        ) : (
          <div className="empty">
            <p>No hay entradas esta semana</p>
          </div>
        )}
      </section>
    </Container>
  );
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.bgtotal};
  border-radius: 10px;
  box-shadow: -4px 0px 4px -2px rgba(0, 0, 0, 0.25),
    2px 2px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 0 10px;
  height: 200px;

  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px 0;
    box-sizing: border-box;
  }

  .header {
    display: flex;
    justify-content: center;
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

  .chart-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex-grow: 1;
  }

  .pie-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    flex-shrink: 0;
    padding: 0 5px;

    .subtitle {
      color: #9291a5;
      font-size: 11px;
    }

    .total {
      font-size: 20px;
      font-weight: bold;
      color: #333;
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

  @media ${Device.laptop} {
    height: 100%;
  }
`;

const ChartContainer = styled.div`
  flex-grow: 1;
  min-height: 100px;

  :focus {
    display: none;
  }

  .recharts-wrapper {
    .recharts-cartesian-grid-horizontal line,
    .recharts-cartesian-grid-vertical line {
      stroke: #f0f0f0;
    }
  }

  /* Efectos hover para las secciones del pie */
  .recharts-pie-sector:hover {
    opacity: 0.8;
    transform: scale(1.02);
    transition: all 0.2s ease;
  }

  @media ${Device.laptop} {
    min-height: 100px;
  }
`;

const TooltipContainer = styled.div`
  :focus {
    display: none;
  }
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
