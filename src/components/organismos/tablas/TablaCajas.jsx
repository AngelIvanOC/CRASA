import styled from "styled-components";
import {
  ContentAccionesTabla,
  Paginacion,
  ImagenContent,
  Icono,
} from "../../../index";
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
import Swal from "sweetalert2";
import { supabase, useUsuariosStore } from "../../../index";

export function TablaCajas({
  data,
  refreshCajas,
  setAccion,
  setdataSelect,
  SetopenRegistro,
}) {
  const [columnFilters, setColumnFilters] = useState([]);
  const { dataUsuarios } = useUsuariosStore();

  const esEncargado = dataUsuarios?.id_rol === 3;

  const columns = [
    {
      accessorKey: "codigo_barras",
      header: "CÓDIGO BARRAS",
      cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
      accessorKey: "cantidad",
      header: "CANTIDAD",
      cell: (info) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: "fecha_caducidad",
      header: "CADUCIDAD",
      cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
      accessorKey: "ubicacion",
      header: "UBICACIÓN",
      cell: (info) => (
        <span
          style={{
            fontWeight: info.row.original.tipo !== "caja" ? "bold" : "normal",
            color:
              info.row.original.tipo === "suelto"
                ? "#e67e22"
                : info.row.original.tipo === "piso"
                ? "#e74c3c"
                : "inherit",
          }}
        >
          {info.getValue() || "-"}
        </span>
      ),
    },
    {
      accessorKey: "fecha_entrada",
      header: "ENTRADA",
      cell: (info) => <span>{info.getValue()?.split("T")[0] || "-"}</span>,
    },

    {
      accessorKey: "acciones",
      header: "",
      enableSorting: false,
      cell: (info) => (
        <ContentAccionesTabla
          funcionEditar={
            !esEncargado ? () => editarRegistro(info.row.original) : null
          }
          funcionEliminar={
            !esEncargado ? () => eliminarRegistro(info.row.original) : null
          }
        />
      ),
    },
  ];

  function editarRegistro(registro) {
    setAccion("Editar");
    setdataSelect(registro);
    SetopenRegistro((prev) => {
      if (!prev) return true;
      return prev;
    });
  }

  async function eliminarRegistro(registro) {
    const tipoTexto =
      registro.tipo === "caja"
        ? "caja"
        : registro.tipo === "suelto"
        ? "registro suelto"
        : "registro de piso";

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¡No podrás revertir la eliminación de este ${tipoTexto}!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo",
    });

    if (result.isConfirmed) {
      try {
        if (registro.tipo === "caja" && registro.rack_id) {
          await supabase
            .from("racks")
            .update({ ocupado: false })
            .eq("id", registro.rack_id);
        }

        let tabla;
        switch (registro.tipo) {
          case "caja":
            tabla = "cajas";
            break;
          case "suelto":
            tabla = "suelto";
            break;
          case "piso":
            tabla = "piso";
            break;
          default:
            throw new Error("Tipo de registro no válido");
        }

        await supabase.from(tabla).delete().eq("id", registro.id);

        if (typeof refreshCajas === "function") {
          refreshCajas();
        }

        Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: `El ${tipoTexto} ha sido eliminado correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  }

  const table = useReactTable({
    data: data || [],
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
            width: 20%;
          }
          &:nth-child(2) {
            width: 12%;
          }
          &:nth-child(3) {
            width: 20%;
          }
          &:nth-child(4) {
            width: 23%;
          }
          &:nth-child(5) {
            width: 20%;
          }
          &:nth-child(6) {
            width: 5%;
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
          width: 20%;
        }
        &:nth-child(2) {
          width: 12%;
        }
        &:nth-child(3) {
          width: 20%;
        }
        &:nth-child(4) {
          width: 23%;
        }
        &:nth-child(5) {
          width: 20%;
        }
        &:nth-child(6) {
          width: 5%;
        }
      }
    }

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
