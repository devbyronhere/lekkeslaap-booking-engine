import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/Stores/useBookingStore';
import { DateStep } from './DateStep';
import { RoomStep } from './RoomStep';
import { SummaryStep } from './SummaryStep';
import { StatusStep } from './StatusStep';
import type { PropertyData } from '@/types/property';
import type { User } from '@/types';

interface BookingWizardProps {
  propertyData: PropertyData;
  auth: { user: User | null };
}

const STEPS = [
  { number: 1, label: 'Dates' },
  { number: 2, label: 'Rooms' },
  { number: 3, label: 'Summary' },
  { number: 5, label: 'Status' },
] as const;

export function BookingWizard({ propertyData, auth }: BookingWizardProps) {
  const currentStep = useBookingStore((s) => s.currentStep);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  // Focus management on step change
  useEffect(() => {
    stepContainerRef.current?.focus();
  }, [currentStep]);

  return (
    <div className={cn('mx-auto w-full max-w-3xl space-y-8')}>
      {/* Step indicator */}
      <nav aria-label="Booking progress">
        <ol className={cn('flex items-center justify-center gap-2 sm:gap-4')}>
          {STEPS.map(({ number, label }) => {
            const isActive = currentStep === number;
            const isCompleted = currentStep > number;
            // Status step is only reached via booking submission
            const isReachable = number < 5 || currentStep === 5;

            return (
              <li key={number} className={cn('flex items-center gap-2')}>
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-primary/20 text-primary',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Step ${number}: ${label}${isCompleted ? ' (completed)' : ''}${isActive ? ' (current)' : ''}`}
                >
                  {isCompleted ? (
                    <svg className={cn('h-4 w-4')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    number === 5 ? 4 : number
                  )}
                </div>
                <span
                  className={cn(
                    'hidden text-sm sm:inline',
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                    !isReachable && 'opacity-50'
                  )}
                >
                  {label}
                </span>
                {number !== 5 && (
                  <div
                    className={cn(
                      'hidden h-px w-8 sm:block',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div
        ref={stepContainerRef}
        tabIndex={-1}
        className={cn('outline-none')}
        aria-live="polite"
      >
        {currentStep === 1 && <DateStep />}
        {currentStep === 2 && <RoomStep propertyData={propertyData} />}
        {currentStep === 3 && <SummaryStep propertyData={propertyData} auth={auth} />}
        {currentStep === 5 && <StatusStep propertyData={propertyData} />}
      </div>
    </div>
  );
}
