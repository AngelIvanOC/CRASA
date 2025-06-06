import { create } from "zustand";
import { Light, Dark } from "../styles/themes";
export const useThemeStore = create((set, get) => ({
  theme: "Light",
  themeStyle: Light,
  setTheme: () => {
    const { theme } = get();
    set({ theme: theme === "Light" ? "Dark" : "Light" });
    set({ themeStyle: theme === "Light" ? Dark : Light });
  },
}));
