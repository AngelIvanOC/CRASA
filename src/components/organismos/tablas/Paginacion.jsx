import React, { useState } from "react";
import { v } from "../../../styles/variables";
import styled from "styled-components";
import { Btnpaginacion } from "../../../index";

export const Paginacion = ({ table }) => {
  const opciones = [10, 20, 30, 50, 100]; // Opciones de filas por página

  return (
    <Container>
      <section className="paginacion">
        {/* Botón ir al inicio */}
        <Btnpaginacion
          disabled={!table.getCanPreviousPage()}
          funcion={() => table.setPageIndex(0)}
          bgcolor="#fff"
          icono={<v.iconotodos />}
        />

        {/* Información total de registros */}
        <div className="info-registros">
          <span>
            {table.getFilteredRowModel().rows.length} registros en total
          </span>
        </div>
      </section>

      {/* Controles de paginación */}
      <section className="paginacion">
        {/* Selector de filas por página */}
        <div className="filas-por-pagina">
          <span>Filas por pagina:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {opciones.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <Btnpaginacion
          disabled={!table.getCanPreviousPage()}
          funcion={() => table.previousPage()}
          bgcolor={"#fff"}
          icono={<v.iconoflechaizquierda />}
        />

        <span>{table.getState().pagination.pageIndex + 1}</span>
        <p className="parrafo">/{table.getPageCount()} </p>

        <Btnpaginacion
          disabled={!table.getCanNextPage()}
          funcion={() => table.nextPage()}
          bgcolor="#fff"
          icono={<v.iconoflechaderecha />}
        />
      </section>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.bgtotalTransparente};
  border-radius: 0 0 5px 5px;
  height: 5vh;
  flex-shrink: 0;
  padding: 10px 15px;

  box-sizing: border-box;

  .filas-por-pagina {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: ${({ theme }) => theme.textsecundario};

    select {
      padding: 4px 0px;
      border: transparent;
      border-radius: 0;
      background-color: transparent;
      color: ${({ theme }) => theme.textsecundario};
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #007bff;
      }
    }
  }

  .paginacion {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;

    .parrafo {
      padding: 0;
      margin: 0;
    }
  }

  .info-registros {
    font-size: 14px;
    color: ${({ theme }) => theme.textsecundario};
  }

  /* Responsive */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;

    .filas-por-pagina,
    .info-registros {
      order: 3;
    }

    .paginacion {
      order: 2;
    }
  }
`;
