import { create } from 'zustand';
import { produce } from 'immer';
import { FabricObject } from 'fabric';
import { devtools } from 'zustand/middleware';

export type ElementType = 'Rect' | 'Circle' | 'Textbox';

export interface ElementObject extends FabricObject {}

export interface ElementsState {
  elements: ElementObject[];
  selectedId: ElementObject['id'] | null;
  setSelectedId: (id: ElementObject['id'] | null) => void;
  addElement: (element: ElementObject) => void;
  updateElement: (
    id: ElementObject['id'],
    updates: Partial<ElementObject>
  ) => void;
  removeElement: (id: ElementObject['id']) => void;
  setElements: (elements: ElementObject[]) => void;
  getSelected: () => ElementObject | null;
}

export const useElementsStore = create<ElementsState>()(
  devtools(
    (set, get) => ({
      elements: [],
      selectedId: null,
      setSelectedId: (id) => set({ selectedId: id }),
      getSelected: () => {
        const state = get();
        return (
          state.elements.find((obj) => obj.id === state.selectedId) || null
        );
      },

      addElement: (element) =>
        set((state) => ({ elements: [...state.elements, element] })),

      updateElement: (id, updates) =>
        set(
          produce((state: ElementsState) => {
            const el = state.elements.find((e) => e.id === id);
            if (el) Object.assign({}, el, updates);
          })
        ),

      removeElement: (id) =>
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selected: state.selectedId === id ? null : state.selectedId,
        })),
      setElements: (elements) => set({ elements }),
    }),
    { name: 'ElementsStore' }
  )
);
