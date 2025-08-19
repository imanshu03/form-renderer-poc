import { useFormStore } from '@/store/formStore';
import { Button } from '@/components/ui/button';
import { FormRenderer } from '../form/FormRenderer';

export function Playground() {
  const { schemaText, setSchemaText, parseSchema, schema } = useFormStore();

  return (
    <div className="flex h-screen">
      <div className="w-1/2 border-r flex flex-col">
        <textarea
          className="flex-1 w-full p-2 font-mono text-sm"
          value={schemaText}
          onChange={(e) => setSchemaText(e.target.value)}
        />
        <div className="p-2 border-t">
          <Button onClick={parseSchema}>Render</Button>
        </div>
      </div>
      <div className="flex-1 relative">
        {schema ? <FormRenderer /> : <div className="p-4">Enter schema and render</div>}
      </div>
    </div>
  );
}
