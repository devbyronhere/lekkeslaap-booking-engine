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
  const goToStep = useBookingStore((s) => s.goToStep);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const currentStepIndex = STEPS.findIndex((s) => s.number === currentStep);
  const currentStepConfig = STEPS[currentStepIndex];
  const progressPercent = (currentStepIndex / (STEPS.length - 1)) * 100;
  const displayStep = currentStep === 5 ? 4 : currentStep;

  useEffect(() => {
    stepContainerRef.current?.focus();
  }, [currentStep]);

  return (
    <div className={cn('mx-auto w-full max-w-3xl space-y-8')}>
      {/* Step indicator */}
      <nav aria-label="Booking progress" className={cn('rounded-xl p-4')}>
        <ol className={cn('flex items-center')}>
          {STEPS.map(({ number, label }, index) => {
            const displayNumber = number === 5 ? 4 : number;
            const isActive = currentStep === number;
            const isCompleted = currentStep > number;

            return (
              <li key={number} className={cn('flex items-center', index < STEPS.length - 1 && 'flex-1')}>
                <button
                  type="button"
                  onClick={() => isCompleted && goToStep(number)}
                  disabled={!isCompleted}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-1 py-1 transition-colors sm:pr-3',
                    isActive && 'bg-primary/10',
                    isCompleted && 'cursor-pointer hover:bg-primary/10'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                      isActive && 'border-primary bg-primary text-primary-foreground shadow-sm',
                      isCompleted && 'border-primary bg-primary text-primary-foreground',
                      !isActive && !isCompleted && 'border-gray-300 bg-gray-200 text-gray-400'
                    )}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Step ${displayNumber}: ${label}${isCompleted ? ' (completed)' : ''}${isActive ? ' (current)' : ''}`}
                  >
                    {isCompleted ? (
                      <svg className={cn('h-4 w-4')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      displayNumber
                    )}
                  </div>
                  <span
                    className={cn(
                      'hidden text-sm sm:inline',
                      isActive && 'font-semibold text-foreground',
                      isCompleted && 'font-medium text-primary',
                      !isActive && !isCompleted && 'text-gray-400'
                    )}
                  >
                    {label}
                  </span>
                </button>
                {/* Connector line between steps */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-3 hidden h-0.5 flex-1 rounded-full sm:block',
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
        {/* Progress bar */}
        <div className={cn('mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted')} aria-hidden="true">
          <div
            className={cn('h-full rounded-full bg-primary transition-all duration-300')}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Mobile step label */}
        <p className={cn('mt-2 text-center text-sm text-muted-foreground sm:hidden')}>
          Step {displayStep} of 4:{' '}
          <span className={cn('font-medium text-foreground')}>
            {currentStepConfig?.label}
          </span>
        </p>
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
