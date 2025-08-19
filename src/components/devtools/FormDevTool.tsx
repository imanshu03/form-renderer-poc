import { useFormContext } from 'react-hook-form';
import { useFormStore } from '@/store/formStore';

export function FormDevTool() {
  const form = useFormContext();
  const store = useFormStore();
  const values = form.watch();
  return (
    <div className="absolute bottom-2 right-2 w-80 h-64 overflow-auto border rounded bg-background p-2 text-xs">
      <pre>{JSON.stringify({ values, store }, null, 2)}</pre>
    </div>
  );
}
