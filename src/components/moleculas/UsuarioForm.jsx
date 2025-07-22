import React from "react";
import { InputText } from "../../index";
import { v } from "../../styles/variables";

export const UsuarioForm = ({
  register,
  errors,
  roles,
  dataSelect,
  accion,
}) => {
  return (
    <section className="form-subcontainer">
      <article>
        <InputText icono={<v.iconoFlechabajo />}>
          <input
            className="form__field"
            type="text"
            placeholder="Nombres completos"
            {...register("nombres", { required: true })}
          />
          <label className="form__label">Nombres</label>
          {errors.nombres?.type === "required" && <p>Campo requerido</p>}
        </InputText>
      </article>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <article>
          <InputText icono={<v.iconoFlechabajo />}>
            <input
              className="form__field"
              type="tel"
              placeholder="Teléfono"
              {...register("telefono")}
            />
            <label className="form__label">Teléfono</label>
          </InputText>
        </article>

        <article>
          <InputText icono={<v.iconoFlechabajo />}>
            <input
              className="form__field"
              type="email"
              placeholder="Correo electrónico"
              {...register("correo", { required: true, pattern: /^\S+@\S+$/i })}
            />
            <label className="form__label">Correo</label>
          </InputText>
        </article>
      </div>

      {accion === "Nuevo" && (
        <>
          <article>
            <InputText icono={<v.iconoFlechabajo />}>
              <input
                className="form__field"
                type="password"
                placeholder="Contraseña"
                {...register("password", {
                  required: accion === "Nuevo",
                  minLength: 6,
                })}
              />
              <label className="form__label">Contraseña</label>
              {errors.password?.type === "required" && <p>Campo requerido</p>}
              {errors.password?.type === "minLength" && (
                <p>Mínimo 6 caracteres</p>
              )}
            </InputText>
          </article>
        </>
      )}

      <article>
        <InputText icono={<v.iconoFlechabajo />}>
          <input
            className="form__field"
            type="text"
            placeholder="Dirección"
            {...register("direccion")}
          />
          <label className="form__label">Dirección</label>
        </InputText>
      </article>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <article>
          <InputText icono={<v.iconoFlechabajo />}>
            <select
              className="form__field"
              {...register("id_rol", { valueAsNumber: true, required: true })}
              defaultValue={dataSelect?.id_rol || ""}
            >
              <option value="">Seleccione rol</option>
              {roles?.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
            <label className="form__label">Rol</label>
            {errors.id_rol?.type === "required" && <p>Campo requerido</p>}
          </InputText>
        </article>

        <article>
          <InputText icono={<v.iconoFlechabajo />}>
            <select
              className="form__field"
              {...register("estado")}
              defaultValue={dataSelect?.estado || "ACTIVO"}
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
            <label className="form__label">Estado</label>
          </InputText>
        </article>
      </div>
    </section>
  );
};
