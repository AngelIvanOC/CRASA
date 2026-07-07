import styled from "styled-components";
import {
  ContentAccionesTabla,
  useCategoriasStore,
  Paginacion,
  ImagenContent,
  Icono,
  useVentasStore,
  descargarOrdenSurtido,
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

export function TablaProductosVenta({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
  ventaId,
  estadoVenta,
  codigoVenta,
}) {
  if (data == null) return;
  const [pagina, setPagina] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);

  const { detalleVenta, eliminarProductoVenta, surtirDetalleVenta } =
    useVentasStore();
  const filas = detalleVenta?.length ? detalleVenta : data;

  function surtir(detalle) {
    Swal.fire({
      title: "¿Surtir este producto?",
      text: "Se descontará inventario de piso, suelto y cajas (en ese orden) para cubrir la cantidad pendiente.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, surtir",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const resultado = await surtirDetalleVenta(detalle.id, ventaId);
      if (!resultado) return;

      await descargarOrdenSurtido({
        codigoPedido: codigoVenta,
        fecha: new Date(),
        productos: [resultado],
      });

      if (resultado.cantidad_faltante === 0) {
        Swal.fire({
          icon: "success",
          title: "Producto surtido",
          text: "Se cubrió toda la cantidad requerida.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else if (resultado.cantidad_surtida_ahora === 0) {
        Swal.fire({
          icon: "warning",
          title: "Sin stock disponible",
          text: "No hay inventario disponible en piso, suelto ni cajas para este producto.",
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Surtido parcial",
          text: `Se cubrieron ${resultado.cantidad_surtida_ahora} unidades. Faltan ${resultado.cantidad_faltante}.`,
        });
      }
    });
  }

  function eliminar(p) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Una vez eliminado, ¡no podrá recuperar este producto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const ok = await eliminarProductoVenta(p.id);
        if (ok) {
          Swal.fire("Eliminado", "Producto eliminado con éxito", "success");
        }
      }
    });
  }

  function editar(data) {
    if (data.nombre === "General") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Este registro no se permite modificar ya que es valor por defecto.",
        footer: '<a href="">...</a>',
      });
      return;
    }
    SetopenRegistro(true);
    setdataSelect(data);
    setAccion("Editar");
  }

  const columns = [
    {
      accessorKey: "productos.codigo",
      header: "#",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "productos.nombre",
      header: "NOMBRE",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "cantidad",
      header: "CANTIDAD",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "escaneado",
      header: "SURTIDO",
      cell: (info) => (
        <span>{`${info.getValue() || 0} / ${info.row.original.cantidad}`}</span>
      ),
    },
    {
      accessorKey: "estado",
      header: "ESTADO",
      cell: (info) => (
        <span className={`estado-badge ${info.getValue() || "incompleto"}`}>
          {info.getValue() || "Incompleto"}
        </span>
      ),
    },
    {
      accessorKey: "acciones",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const detalle = info.row.original;
        const puedeSurtir =
          detalle.estado !== "completado" && estadoVenta !== "Devolucion";

        return (
          <ContentAccionesTabla
            funcionSurtir={puedeSurtir ? () => surtir(detalle) : null}
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data: filas,
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
  height: 74vh;

  .responsive-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    height: 69vh;

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
            width: 15%;
          }
          &:nth-child(2) {
            width: 30%;
          }
          &:nth-child(3) {
            width: 15%;
            text-align: center;
          }
          &:nth-child(4) {
            width: 15%;
            text-align: center;
          }
          &:nth-child(5) {
            width: 15%;
            text-align: center;
          }
          &:nth-child(6) {
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
          width: 30%;
        }
        &:nth-child(3) {
          width: 15%;
        }
        &:nth-child(4) {
          width: 15%;
        }
        &:nth-child(5) {
          width: 15%;
        }
        &:nth-child(6) {
          width: 10%;
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
