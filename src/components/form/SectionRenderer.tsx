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
  return (
    <div className={disabled ? 'opacity-50 pointer-events-none space-y-4' : 'space-y-4'}>
      {section.fields.map((f) => (
        <FieldRenderer key={f.id} field={f} />
      ))}
    </div>
  );
}
