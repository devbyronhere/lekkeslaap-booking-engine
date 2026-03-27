import { cn } from '@/lib/utils';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

interface InertiaFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
}

export function InertiaFormField({
  id,
  label,
  type = 'text',
  value,
  error,
  autoComplete,
  autoFocus,
  required,
  onChange,
}: InertiaFormFieldProps) {
  return (
    <div className={cn('space-y-2')}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p className={cn('text-sm text-destructive')}>{error}</p>
      )}
    </div>
  );
}
