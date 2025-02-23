import { create } from 'zustand';
import { produce } from 'immer';
import { FabricObject } from 'fabric';
import { devtools } from 'zustand/middleware';

export type ElementType = 'Rect' | 'Circle' | 'Textbox';

export interface ElementObject extends FabricObject {}

export interface ElementsState {
  elements: ElementObject[];
  addElement: (element: ElementObject) => void;
  updateElement: (
    id: ElementObject['id'],
    updates: Partial<Omit<ElementObject, 'id'>>
  ) => void;
  removeElement: (id: ElementObject['id']) => void;
  setElements: (elements: ElementObject[]) => void;
}

export const useElementsStore = create<ElementsState>()(
  devtools(
    (set) => ({
      elements: [],

      addElement: (element) =>
        set((state) => ({ elements: [...state.elements, element] })),

      updateElement: (id, updates) =>
        set(
          produce((state: ElementsState) => {
            const el = state.elements.find((e) => e.id === id);
            if (el) Object.assign(el, updates);
          })
        ),

      removeElement: (id) =>
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
        })),
      setElements: (elements) => set({ elements }),
    }),
    { name: 'ElementsStore' }
  )
);
