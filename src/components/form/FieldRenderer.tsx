import { useFormContext } from 'react-hook-form';
import { FieldSchema } from '@/types/form-schema';
import { useFormStore } from '@/store/formStore';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

interface Props {
  field: FieldSchema;
}

export function FieldRenderer({ field }: Props) {
  const form = useFormContext();
  const { visibleFields, enabledFields } = useFormStore();
  if (!visibleFields[field.id]) return null;
  const disabled = !enabledFields[field.id];

  return (
    <FormField
      control={form.control}
      name={field.id}
      render={({ field: rf }) => (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>{renderField(rf)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  function renderField(rf: any) {
    switch (field.type) {
      case 'select':
        return (
          <Select onValueChange={rf.onChange} value={rf.value} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <Checkbox checked={rf.value} onCheckedChange={rf.onChange} disabled={disabled} />
        );
      default:
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            {...rf}
            disabled={disabled}
          />
        );
    }
  }
}
