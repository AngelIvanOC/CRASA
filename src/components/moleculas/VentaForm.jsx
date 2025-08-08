import React from "react";
import { InputText } from "../../index";
import { v } from "../../styles/variables";

export const VentaForm = ({ register, errors, marcas, dataSelect, accion }) => {
  if (accion !== "Editar") return null;

  return (
    <section className="form-subcontainer">
      <article>
        <InputText icono={<v.iconoFlechabajo />}>
          <input
            className="form__field"
            type="text"
            placeholder="Código"
            {...register("codigo", { required: true })}
          />
          <label className="form__label">#Pedido</label>
          {errors.codigo?.type === "required" && <p>Campo requerido</p>}
        </InputText>
      </article>

      <article>
        <InputText icono={<v.iconoFlechabajo />}>
          <select
            className="form__field"
            {...register("marca_id", { valueAsNumber: true, required: true })}
            defaultValue={dataSelect?.marca_id || ""}
          >
            <option value="">Seleccione una marca</option>
            {marcas?.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
          <label className="form__label">Marca</label>
        </InputText>
      </article>

      <article>
        <InputText icono={<v.iconoFlechabajo />}>
          <input
            className="form__field"
            type="date"
            placeholder="Fecha"
            {...register("fecha")}
          />
          <label className="form__label">Fecha</label>
        </InputText>
      </article>
    </section>
  );
};
