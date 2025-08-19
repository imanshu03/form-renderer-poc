import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FormSchema } from '@/types/form-schema';
import { resolvePlaceholders } from '@/lib/placeholder';

interface FormState {
  schemaText: string;
  schema: FormSchema | null;
  contextValues: Record<string, any>;
  currentSectionIndex: number;
  visibleSections: Record<string, boolean>;
  enabledSections: Record<string, boolean>;
  visibleFields: Record<string, boolean>;
  enabledFields: Record<string, boolean>;
  setSchemaText: (text: string) => void;
  setContextValues: (ctx: Record<string, any>) => void;
  parseSchema: () => void;
  setCurrentSection: (index: number) => void;
  setFieldVisibility: (id: string, value: boolean) => void;
  setFieldEnabled: (id: string, value: boolean) => void;
  setSectionVisibility: (id: string, value: boolean) => void;
  setSectionEnabled: (id: string, value: boolean) => void;
}

export const useFormStore = create<FormState>()(
  devtools((set, get) => ({
    schemaText: '',
    schema: null,
    contextValues: {},
    currentSectionIndex: 0,
    visibleSections: {},
    enabledSections: {},
    visibleFields: {},
    enabledFields: {},
    setSchemaText: (text) => set({ schemaText: text }),
    setContextValues: (ctx) => set({ contextValues: ctx }),
    parseSchema: () => {
      try {
        const raw = JSON.parse(get().schemaText);
        const schema = resolvePlaceholders(raw, get().contextValues);
        const visibleSections: Record<string, boolean> = {};
        const enabledSections: Record<string, boolean> = {};
        const visibleFields: Record<string, boolean> = {};
        const enabledFields: Record<string, boolean> = {};
        schema.sections.forEach((s) => {
          visibleSections[s.id] = s.visible !== false;
          enabledSections[s.id] = s.enabled !== false;
          s.fields.forEach((f) => {
            visibleFields[f.id] = f.visible !== false;
            enabledFields[f.id] = f.enabled !== false;
          });
        });
        set({ schema, visibleSections, enabledSections, visibleFields, enabledFields, currentSectionIndex: 0 });
      } catch (e) {
        console.error('Invalid schema', e);
      }
    },
    setCurrentSection: (index) => set({ currentSectionIndex: index }),
    setFieldVisibility: (id, value) => set((state) => ({
      visibleFields: { ...state.visibleFields, [id]: value },
    })),
    setFieldEnabled: (id, value) => set((state) => ({
      enabledFields: { ...state.enabledFields, [id]: value },
    })),
    setSectionVisibility: (id, value) => set((state) => ({
      visibleSections: { ...state.visibleSections, [id]: value },
    })),
    setSectionEnabled: (id, value) => set((state) => ({
      enabledSections: { ...state.enabledSections, [id]: value },
    })),
  }))
);
