import { useEffect, useState } from "react";
import { useMarcasStore } from "../../../../store/MarcasStore";
import { BaseCard } from "../../../cards/BaseCard";
import { ToggleList } from "../../../cards/ToggleList";
import { NumberInput } from "../../../cards/NumberInput";

export function CardNotificaciones() {
  const { configuracion, obtenerConfiguracion, actualizarConfiguracion } =
    useMarcasStore();

  useEffect(() => {
    //obtenerConfiguracion();
  }, []);

  const handleToggleChange = (key, value) => {
    actualizarConfiguracion({ [key]: value });
  };

  const handleDaysChange = (days) => {
    actualizarConfiguracion({ diasAntelacion: days });
  };

  const toggleItems = [
    {
      key: "habilitarAlertas",
      label: "Habilitar alertas",
      checked: configuracion?.habilitarAlertas || false,
    },
    {
      key: "notificarCorreo",
      label: "Notificar por correo",
      checked: configuracion?.notificarCorreo || false,
    },
  ];

  return (
    <BaseCard titulo="Alertas y Notificaciones" loading={!configuracion}>
      <ToggleList items={toggleItems} onChange={handleToggleChange} />

      <NumberInput
        label="Dias de antelacion"
        value={configuracion?.diasAntelacion || 7}
        onChange={handleDaysChange}
        min={1}
        max={365}
      />
    </BaseCard>
  );
}
