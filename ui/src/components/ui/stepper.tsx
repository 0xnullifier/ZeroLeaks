'use client';

import * as React from 'react';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

interface StepperContextType {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  hasCompletedAllSteps: boolean;
}

const StepperContext = React.createContext<StepperContextType | undefined>(
  undefined
);

export function useStepper() {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a Stepper');
  }
  return context;
}

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  totalSteps: number;
  initialStep?: number;
}

export function Stepper({
  children,
  totalSteps,
  initialStep = 0,
  className,
  ...props
}: StepperProps) {
  const [currentStep, setCurrentStep] = React.useState(initialStep);
  const [hasCompletedAllSteps, setHasCompletedAllSteps] = React.useState(false);

  const nextStep = React.useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      if (next >= totalSteps) {
        setHasCompletedAllSteps(true);
        return prev;
      }
      return next;
    });
  }, [totalSteps]);

  const prevStep = React.useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev - 1;
      if (next < 0) return 0;
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      currentStep,
      totalSteps,
      nextStep,
      prevStep,
      hasCompletedAllSteps,
    }),
    [currentStep, totalSteps, nextStep, prevStep, hasCompletedAllSteps]
  );

  return (
    <StepperContext.Provider value={value}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </StepperContext.Provider>
  );
}

export function StepperProgress({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { currentStep, totalSteps } = useStepper();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div
      className={cn('flex flex-row gap-2 items-center', className)}
      {...props}
    >
      <Progress value={progress} className="h-2 bg-muted" />
      <span className="text-sm text-secondary-foreground">
        {currentStep + 1}/{totalSteps}
      </span>
    </div>
  );
}

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  children: React.ReactNode;
}

export function Step({ children, index, className, ...props }: StepProps) {
  const { currentStep } = useStepper();
  if (currentStep !== index) return null;

  return (
    <div className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  );
}