import styled from "styled-components";
import {
  useVentasStore,
  Paginacion,
  ContentAccionesTabla,
} from "../../../index";
import { v } from "../../../styles/variables";
import { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { FaCaretDown, FaCaretUp } from "react-icons/fa6";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function TablaVentas({
  data,
  onVerDetalle,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  const { dataVentas, mostrarVentas, eliminarVenta } = useVentasStore();
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [datas, setData] = useState(data);
  const [columnFilters, setColumnFilters] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    mostrarVentas();
  }, []);

  const handleVerDetalle = (venta) => {
    navigate(`/ventas/${venta.id}/productos`);
  };

  function editar(data) {
    SetopenRegistro(true);
    setdataSelect(data);
    setAccion("Editar");
  }

  function eliminar(venta) {
    Swal.fire({
      title: "¿Estás seguro(a)?",
      text: "Una vez eliminada, ¡no podrá recuperar esta venta y todos sus productos asociados!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Usar el store de ventas para eliminar
          const { eliminarVenta } = useVentasStore.getState();
          await eliminarVenta({ id: venta.id });

          Swal.fire({
            icon: "success",
            title: "¡Eliminada!",
            text: "La venta ha sido eliminada correctamente.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un problema al eliminar la venta.",
          });
        }
      }
    });
  }

  const columns = [
    {
      accessorKey: "codigo",
      header: "# PEDIDO",
      cell: (info) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: "marcas.nombre",
      header: "MARCA",
      cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
      accessorKey: "cantidad_productos",
      header: "CANTIDAD",
      cell: (info) => <span>{info.getValue() || 0}</span>,
    },
    {
      accessorKey: "cantidad_total",
      header: "CANT. TOTAL",
      cell: (info) => <span>{info.getValue() || 0}</span>,
    },
    {
      accessorKey: "fecha",
      header: "FECHA",
      cell: (info) => (
        <span>{new Date(info.getValue()).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: "factura_url",
      header: "FACTURA",
      enableSorting: false,
      cell: (info) =>
        info.getValue() ? (
          <a
            href={info.getValue()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ver-factura"
          >
            <FaEye />
          </a>
        ) : (
          <span>-</span>
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
          funcionVer={() => handleVerDetalle(info.row.original)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: dataVentas || [],
    columns,
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
            width: 15%;
          } /* # PEDIDO */
          &:nth-child(2) {
            width: 20%;
          } /* MARCA */
          &:nth-child(3) {
            width: 12%;
          } /* CANTIDAD */
          &:nth-child(4) {
            width: 15%;
          } /* CANTIDAD TOTAL */
          &:nth-child(5) {
            width: 15%;
          } /* FECHA */
          &:nth-child(6) {
            width: 13%;
            text-align: center;
          } /* FACTURA */
          &:nth-child(7) {
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
          width: 15%;
        }
        &:nth-child(2) {
          width: 20%;
        }
        &:nth-child(3) {
          width: 12%;
        }
        &:nth-child(4) {
          width: 15%;
        }
        &:nth-child(5) {
          width: 15%;
        }
        &:nth-child(6) {
          width: 13%;
        }
        &:nth-child(7) {
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

    /* Estilos específicos para el botón de factura */
    .btn-ver-factura {
      color: #023e8f;
      cursor: pointer;
      font-size: 16px;
      transition: color 0.2s ease;

      &:hover {
        color: ${(props) => props.theme.colorPrincipal};
      }
    }
  }
`;
