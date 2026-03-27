import { cn } from '@/lib/utils';

interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className={cn('text-sm text-destructive')} role="alert">
      {message}
    </p>
  );
}
