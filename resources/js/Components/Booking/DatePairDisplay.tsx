import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DatePairDisplayProps {
  checkIn: string | null;
  checkOut: string | null;
}

export function DatePairDisplay({ checkIn, checkOut }: DatePairDisplayProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-4')}>
      <div>
        <p className={cn('text-sm text-muted-foreground')}>Check-in</p>
        <p className={cn('font-medium')}>
          {checkIn ? format(new Date(checkIn), 'PPP') : '-'}
        </p>
      </div>
      <div>
        <p className={cn('text-sm text-muted-foreground')}>Check-out</p>
        <p className={cn('font-medium')}>
          {checkOut ? format(new Date(checkOut), 'PPP') : '-'}
        </p>
      </div>
    </div>
  );
}
