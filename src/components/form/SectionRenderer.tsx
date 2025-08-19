import { SectionSchema } from '@/types/form-schema';
import { useFormStore } from '@/store/formStore';
import { FieldRenderer } from './FieldRenderer';

interface Props {
  section: SectionSchema;
}

export function SectionRenderer({ section }: Props) {
  const { visibleSections, enabledSections } = useFormStore();
  if (!visibleSections[section.id]) return null;
  const disabled = !enabledSections[section.id];
  const columns = section.layout?.columns ?? 1;
  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <div className={`grid grid-cols-${columns} gap-4`}>
        {section.fields.map((f) => (
          <FieldRenderer
            key={f.id}
            field={f}
            className={`col-span-${f.span ?? 1}`}
          />
        ))}
      </div>
    </div>
  );
}
