import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { MinusIcon, PlusIcon } from 'lucide-react';

type StepperSize = 'sm' | 'md' | 'lg';

const buttonSizeClasses: Record<StepperSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'min-h-11 min-w-11',
};

const iconSizeClasses: Record<StepperSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

const countClasses: Record<StepperSize, string> = {
  sm: 'w-6 text-center text-sm font-medium',
  md: 'w-6 text-center text-sm font-medium',
  lg: 'w-8 text-center text-lg font-medium',
};

interface StepperProps {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
  decreaseLabel: string;
  increaseLabel: string;
  valueLabel: string;
  size?: StepperSize;
}

export function Stepper({
  value,
  onDecrease,
  onIncrease,
  canDecrease,
  canIncrease,
  decreaseLabel,
  increaseLabel,
  valueLabel,
  size = 'md',
}: StepperProps) {
  return (
    <div className={cn('flex items-center gap-' + (size === 'lg' ? '3' : '2'))}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(buttonSizeClasses[size])}
        onClick={onDecrease}
        disabled={!canDecrease}
        aria-label={decreaseLabel}
      >
        <MinusIcon className={cn(iconSizeClasses[size])} />
      </Button>
      <span
        className={cn(countClasses[size])}
        aria-live="polite"
        aria-label={valueLabel}
      >
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(buttonSizeClasses[size])}
        onClick={onIncrease}
        disabled={!canIncrease}
        aria-label={increaseLabel}
      >
        <PlusIcon className={cn(iconSizeClasses[size])} />
      </Button>
    </div>
  );
}
