import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { idbGet, idbSet } from "../db";

export type Kind = "spell" | "feature";

export type SelectedItem = {
  id: string;
  kind: Kind;
};

type PacksCtx = {
  selected: SelectedItem[];
  add: (item: SelectedItem) => void;
  remove: (id: string, kind: Kind) => void;
  clear: () => void;
  isSelected: (id: string, kind: Kind) => boolean;
  ready: boolean;
};

const Ctx = createContext<PacksCtx | null>(null);
const IDB_KEY = "packs.selected";

/** use a tiny debounce so we don't spam IDB on rapid clicks */
function useDebouncedEffect(effect: () => void, deps: any[], ms: number) {
  const t = useRef<number | null>(null);
  useEffect(() => {
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => effect(), ms);
    return () => {
      if (t.current) window.clearTimeout(t.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function PacksProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [ready, setReady] = useState(false);

  // 1) Load from IndexedDB once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const persisted = await idbGet<SelectedItem[]>(IDB_KEY);
        if (alive && Array.isArray(persisted)) {
          setSelected(persisted);
        }
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 2) Persist to IndexedDB when it changes (debounced)
  useDebouncedEffect(() => {
    // only persist after first load to avoid overwriting IDB with []
    if (!ready) return;
    idbSet(IDB_KEY, selected).catch(() => {});
  }, [selected, ready], 150);

  const api = useMemo<PacksCtx>(() => {
    const isSelected = (id: string, kind: Kind) =>
      selected.some((s) => s.id === id && s.kind === kind);

    const add = (item: SelectedItem) =>
      setSelected((old) =>
        old.some((s) => s.id === item.id && s.kind === item.kind)
          ? old
          : [...old, item]
      );

    const remove = (id: string, kind: Kind) =>
      setSelected((old) => old.filter((s) => !(s.id === id && s.kind === kind)));

    const clear = () => setSelected([]);

    return { selected, add, remove, clear, isSelected, ready };
  }, [selected, ready]);

  return createElement(Ctx.Provider, { value: api }, children);
}

export function usePacks(): PacksCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePacks must be used inside <PacksProvider>");
  return ctx;
}
