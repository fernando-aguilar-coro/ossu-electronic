import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage the playback controls of a multi-step simulation.
 * Handles the state of current step, play/pause state, interval timer, and step boundary bounds.
 */
export function useAnimationPlayer(
  totalSteps: number,
  defaultDelay: number = 1000
) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop playback and clear the active interval timer
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
  }, []);

  // Clear timer on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start/Resume playback from the current step
  const play = useCallback(() => {
    if (totalSteps <= 0) return;
    
    stop();
    setPlaying(true);
    
    let currentStep = step;
    if (currentStep >= totalSteps) {
      currentStep = 0;
      setStep(0);
    }
    
    timerRef.current = setInterval(() => {
      currentStep++;
      setStep(currentStep);
      
      if (currentStep >= totalSteps) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setPlaying(false);
      }
    }, defaultDelay);
  }, [step, totalSteps, defaultDelay, stop]);

  // Go to the next step
  const next = useCallback(() => {
    setStep(s => Math.min(totalSteps, s + 1));
  }, [totalSteps]);

  // Go to the previous step
  const prev = useCallback(() => {
    setStep(s => Math.max(1, s - 1));
  }, []);

  // Reset playback to initial state (step 0, stopped)
  const reset = useCallback(() => {
    stop();
    setStep(0);
  }, [stop]);

  // Jump to a specific step and stop playback
  const startAt = useCallback((initialStep: number) => {
    stop();
    setStep(initialStep);
  }, [stop]);

  return {
    step,
    setStep,
    playing,
    stop,
    play,
    next,
    prev,
    reset,
    startAt,
  };
}
