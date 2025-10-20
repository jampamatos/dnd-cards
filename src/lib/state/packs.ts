import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Kind = "spell" | "feature" | "beast";
export type SelectedItem = { id: string; kind: Kind };

type PacksState = {
    selected: SelectedItem[];
    add: (it: SelectedItem) => void;
    remove: (it: string, kind: Kind) => void;
    clear: () => void;
    isSelected: (id: string, kind: Kind) => boolean;
};

export const usePacks = create<PacksState>()(
    persist(
        (set, get) => ({
            selected: [],
            add: (it) => {
                if (get().selected.some(x => x.id === it.id && x.kind === it.kind)) return;
                set(s => ({ selected: [...s.selected, it] }));
            },
            remove: (id, kind) =>
                set((s) => ({ selected: s.selected.filter(x => !(x.id === id && x.kind === kind)) })),
            clear: () => set({ selected: [] }),
            isSelected: (id, kind) => get().selected.some(x => x.id === id && x.kind === kind),
        }),
        { name: "dnd-cards-packs" }
    )
);