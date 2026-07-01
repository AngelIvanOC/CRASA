import { useEffect } from "react";
import { supabase } from "../supabase/supabase.config";
import { useQueryClient } from "@tanstack/react-query";

export function useSupabaseRealtime(tablas = []) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const canales = tablas.map((tabla) =>
      supabase
        .channel(`realtime:${tabla}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: tabla },
          () => {
            queryClient.invalidateQueries({ queryKey: [tabla] });
          }
        )
        .subscribe()
    );

    return () => {
      canales.forEach((canal) => canal.unsubscribe());
    };
  }, [tablas]);
}
