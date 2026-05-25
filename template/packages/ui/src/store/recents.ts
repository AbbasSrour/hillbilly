import { createSelectors } from "@hillbilly/ui/lib/selectors";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Recent {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface RecentsStore {
  recents: Recent[];
  addRecent: (recent: { name: string; url: string; icon: string }) => void;
  removeRecent: (id: string) => void;
  clear: () => void;
}

const useBaseRecentStore = create<RecentsStore>()(
  persist(
    (set, get) => ({
      recents: [],
      addRecent: (recent: { name: string; url: string; icon: string }) => {
        const id = crypto.randomUUID();
        const existingIndex = get().recents.findIndex((r) => r.url === recent.url);

        if (existingIndex !== -1) {
          // biome-ignore lint/style/noNonNullAssertion: if an index is found, it exists
          const existing = get().recents[existingIndex]!;
          set({
            recents: [existing, ...get().recents.filter((_, i) => i !== existingIndex)],
          });

          return;
        }

        set({ recents: [{ id, ...recent }, ...get().recents] });
      },
      removeRecent: (id: string) => {
        set({ recents: get().recents.filter((recent) => recent.id !== id) });
      },
      clear: () => {
        set({ recents: [] });
      },
    }),
    {
      name: "recents-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useRecentsStore = createSelectors(useBaseRecentStore);
