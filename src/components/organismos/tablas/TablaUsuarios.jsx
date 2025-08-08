import styled from "styled-components";
import {
  useUsuariosStore,
  Paginacion,
  ContentAccionesTabla,
} from "../../../index";
import { v } from "../../../styles/variables";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Device } from "../../../index";
import { FaCaretDown, FaCaretUp } from "react-icons/fa6";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import Swal from "sweetalert2";

export function TablaUsuarios({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  const { dataTodosUsuarios, eliminarUsuario } = useUsuariosStore();
  const [columnFilters, setColumnFilters] = useState([]);

  const editar = useCallback(
    (data) => {
      SetopenRegistro(true);
      setdataSelect(data);
      setAccion("Editar");
    },
    [SetopenRegistro, setdataSelect, setAccion]
  );

  const eliminar = useCallback(
    (usuario) => {
      Swal.fire({
        title: "¿Estás seguro(a)?",
        text: "Una vez eliminado, ¡no podrá recuperar este usuario!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await eliminarUsuario({ id: usuario.id });
            Swal.fire({
              icon: "success",
              title: "¡Eliminado!",
              text: "El usuario ha sido eliminado correctamente.",
              timer: 2000,
              showConfirmButton: false,
            });
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un problema al eliminar el usuario.",
            });
          }
        }
      });
    },
    [eliminarUsuario]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "nombres",
        header: "NOMBRE",
        cell: (info) => <span>{info.getValue()}</span>,
      },
      {
        accessorKey: "telefono",
        header: "TELÉFONO",
        cell: (info) => <span>{info.getValue() || "-"}</span>,
      },
      {
        accessorKey: "correo",
        header: "CORREO",
        cell: (info) => <span>{info.getValue() || "-"}</span>,
      },
      {
        accessorKey: "roles.nombre",
        header: "ROL",
        cell: (info) => <span>{info.getValue() || "-"}</span>,
      },
      {
        accessorKey: "estado",
        header: "ESTADO",
        cell: (info) => (
          <span className={`estado ${info.getValue()?.toLowerCase()}`}>
            {info.getValue() || "ACTIVO"}
          </span>
        ),
      },
      {
        accessorKey: "fecharegistro",
        header: "REGISTRO",
        cell: (info) => (
          <span>
            {info.getValue()
              ? new Date(info.getValue()).toLocaleDateString()
              : "-"}
          </span>
        ),
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
    ],
    [editar, eliminar]
  );

  const tableData = useMemo(() => dataTodosUsuarios || [], [dataTodosUsuarios]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (!tableData.length) {
    return (
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <span>No hay usuarios registrados</span>
        </div>
      </Container>
    );
  }

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
  height: 70vh;

  .responsive-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    height: 55vh;

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

            .active {
              color: black;
            }
          }
        }
      }
    }

    tbody {
      display: block;
      max-height: 55vh;
      overflow-y: auto;
      width: 100%;

      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }

      tr {
        display: table;
        width: 100%;
        table-layout: fixed;
        border-bottom: 1px solid #eaecf0;

        td {
          padding: 9px 15px;
          text-align: left;
          color: ${(props) => props.theme.textsecundario};
          display: table-cell;
          vertical-align: middle;

          &:nth-child(1) {
            width: 15%;
          } 
          &:nth-child(2) {
            width: 12%;
          }
          &:nth-child(3) {
            width: 18%;
          } 
          &:nth-child(4) {
            width: 10%;
          } 
          &:nth-child(5) {
            width: 10%;
            text-align: center;

            .estado {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.activo {
                background-color: #e7f5e7;
                color: #2e7d32;
              }

              &.inactivo {
                background-color: #ffebee;
                color: #c62828;
              }
            }
          } 
          &:nth-child(6) {
            width: 13%;
          } 
          &:nth-child(7) {
            width: 10%;
            text-align: center;
          } 
        }
      }
    }

    thead tr {
      display: table;
      width: 100%;
      table-layout: fixed;

      th {
        &:nth-child(1) {
          width: 15%;
        }
        &:nth-child(2) {
          width: 12%;
        }
        &:nth-child(3) {
          width: 18%;
        }
        &:nth-child(4) {
          width: 10%;
        }
        &:nth-child(5) {
          width: 10%;
          .header-content {
            justify-content: center;
          }
        }
        &:nth-child(6) {
          width: 13%;
        }
        &:nth-child(7) {
          width: 10%;
        }
      }
    }

    .resizer {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 0px;
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

  @media ${Device.tablet} {
    height: 80vh;

    .responsive-table {
      height: 75vh;

      tbody {
        max-height: 65vh;
      }

      .resizer {
        width: 5px;
      }
    }
  }
`;
