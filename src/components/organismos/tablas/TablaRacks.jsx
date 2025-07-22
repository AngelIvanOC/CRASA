import styled from "styled-components";
import {
  ContentAccionesTabla,
  useRacksStore,
  Paginacion,
  Icono,
} from "../../../index";
import Swal from "sweetalert2";
import { v } from "../../../styles/variables";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaCaretDown, FaCaretUp } from "react-icons/fa6";

export function TablaRacks({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  if (data == null) return;

  const [pagina, setPagina] = useState(1);
  const [datas, setData] = useState(data);
  const [columnFilters, setColumnFilters] = useState([]);
  const { eliminarRack } = useRacksStore();

  function eliminar(p) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await eliminarRack({ id: p.id });
      }
    });
  }

  function editar(data) {
    SetopenRegistro(true);
    setdataSelect(data);
    setAccion("Editar");
  }

  const columns = [
    {
      accessorKey: "codigo_rack",
      header: "# RACK",
      cell: (info) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: "marcas.nombre",
      header: "MARCA",
      cell: (info) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: "nivel",
      header: "NIVEL",
      cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
      accessorKey: "lado",
      header: "LADO",
      cell: (info) => <span>{info.getValue() || 0}</span>,
    },
    {
      accessorKey: "posicion",
      header: "POSICION",
      cell: (info) => <span>{info.getValue() || 0}</span>,
    },
    
    {
      accessorKey: "ocupado",
      header: "OCUPADO",
      cell: (info) => {
        const value = info.getValue();
        return (
          <span>{value === true ? "Sí" : value === false ? "No" : "-"}</span>
        );
      },
    },
    {
      accessorKey: "productos_info",
      header: "PRODUCTO(S)",
      cell: (info) => {
        const productos = info.getValue();
        if (!productos || productos.length === 0) {
          return <span style={{ color: "#6c757d" }}>Sin producto</span>;
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {productos.map((producto) => (
              <span key={producto.id}>{producto.nombre}</span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "acciones",
      header: "",
      enableSorting: false,
      cell: (info) => (
        <ContentAccionesTabla
          funcionEditar={() => editar(info.row.original)}
          funcionEliminar={() => eliminar(info.row.original)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    meta: {
      updateData: (rowIndex, columnId, value) =>
        setData((prev) =>
          prev.map((row, index) =>
            index === rowIndex
              ? {
                  ...prev[rowIndex],
                  [columnId]: value,
                }
              : row
          )
        ),
    },
  });

  return (
    <Container>
      <table className="responsive-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  <div className="header-content">
                    <span>{header.column.columnDef.header}</span>
                    {header.column.getCanSort() && (
                      <span onClick={header.column.getToggleSortingHandler()}>
                        <span className="flechas">
                          <FaCaretUp
                            className={
                              header.column.getIsSorted() === "asc"
                                ? "active"
                                : ""
                            }
                            style={{ cursor: "pointer" }}
                          />
                          <FaCaretDown
                            className={
                              header.column.getIsSorted() === "desc"
                                ? "active"
                                : ""
                            }
                            style={{ cursor: "pointer" }}
                          />
                        </span>
                      </span>
                    )}
                  </div>
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={`resizer ${
                      header.column.getIsResizing() ? "isResizing" : ""
                    }`}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((item) => (
            <tr key={item.id}>
              {item.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Paginacion table={table} />
    </Container>
  );
}

const Container = styled.div`
  height: 80vh;

  .responsive-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    height: 75vh;

    thead {
      background-color: ${({ theme }) => theme.bgtotalFuerte};
      display: block;
      height: 10vh;
      overflow: hidden;
      width: 100%;

      th {
        padding: 0px 15px;
        text-align: left;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
        color: #414a5a;
        height: 10vh;

        .header-content {
          display: flex;
          align-items: center;
          justify-content: left;
          height: 100%;

          .flechas {
            padding-left: 5px;
            display: flex;
            flex-direction: column;
            font-size: 15px;
            align-items: center;
            line-height: 1;
            color: gray;
            /* Estilos para los iconos activos */
            .active {
              color: black;
            }
          }
        }
      }
    }

    tbody {
      display: block;
      max-height: 65vh;
      overflow-y: auto;
      width: 100%;

      scrollbar-width: none; /* Firefox */
      &::-webkit-scrollbar {
        display: none; /* Chrome, Safari y Edge */
      }

      tr {
        display: table; /* CLAVE: Mantener comportamiento de tabla */
        width: 100%; /* CLAVE: Forzar ancho completo */
        table-layout: fixed; /* CLAVE: Layout fijo para distribución equitativa */
        border-bottom: 1px solid #eaecf0;

        td {
          padding: 9px 15px;
          text-align: left;
          color: ${(props) => props.theme.textsecundario};
          display: table-cell; /* CLAVE: Mantener comportamiento de celda */
          vertical-align: middle;

          /* Distribución específica por columna */
          &:nth-child(1) {
            width: 10%;
          } /* # RACK */
          &:nth-child(2) {
            width: 10%;
          } /* MARCA */
          &:nth-child(3) {
            width: 10%;
          } /* NIVEL */
          &:nth-child(4) {
            width: 10%;
          } /* POSICION */
          &:nth-child(5) {
            width: 15%;
          } /* LADO */
          &:nth-child(6) {
            width: 10%;
          } /* OCUPADO */
          &:nth-child(7) {
            width: 35%;
          } /* PRODUCTO */
          &:nth-child(8) {
            width: 10%;
            text-align: center; /* Centrar acciones */
          } /* ACCIONES */
        }
      }
    }

    /* Asegurar que thead tenga la misma distribución */
    thead tr {
      display: table;
      width: 100%;
      table-layout: fixed;

      th {
        &:nth-child(1) {
          width: 10%;
        }
        &:nth-child(2) {
          width: 10%;
        }
        &:nth-child(3) {
          width: 10%;
        }
        &:nth-child(4) {
          width: 10%;
        }
        &:nth-child(5) {
          width: 15%;
        }
        &:nth-child(6) {
          width: 10%;
        }
        &:nth-child(7) {
          width: 35%;
        }
        &:nth-child(8) {
          width: 10%;
        }
      }
    }

    /* Estilos para el resizer */
    .resizer {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 5px;
      background: rgba(0, 0, 0, 0.5);
      cursor: col-resize;
      user-select: none;
      touch-action: none;

      &.isResizing {
        background: blue;
        opacity: 1;
      }

      @media (hover: hover) {
        opacity: 0;

        &:hover {
          opacity: 1;
        }
      }
    }
  }
`;
