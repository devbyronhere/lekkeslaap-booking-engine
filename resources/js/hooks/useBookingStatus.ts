import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import type { BookingStatus } from '@/types/booking';
import { bookingStatusResponseSchema } from '@/types/booking';

const POLL_INTERVAL_MS = 2500;
const TIMEOUT_MS = 60000;

interface UseBookingStatusResult {
  status: BookingStatus | null;
  confirmationId: string | null;
  isPolling: boolean;
}

export function useBookingStatus(bookingId: number | null): UseBookingStatusResult {
  const [status, setStatus] = useState<BookingStatus | null>(null);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (!bookingId) return;

    setIsPolling(true);
    setStatus('pending');

    const poll = async () => {
      try {
        const { data: raw } = await axios.get(`/api/bookings/${bookingId}/status`);
        const data = bookingStatusResponseSchema.parse(raw);
        setStatus(data.status);
        if (data.confirmation_id) {
          setConfirmationId(data.confirmation_id);
        }
        if (data.status === 'confirmed' || data.status === 'failed') {
          stopPolling();
        }
      } catch {
        // Keep polling on network errors - the server might be temporarily unavailable
      }
    };

    // Poll immediately, then on interval
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    // Safety timeout to prevent infinite polling
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setStatus('failed');
    }, TIMEOUT_MS);

    return stopPolling;
  }, [bookingId, stopPolling]);

  return { status, confirmationId, isPolling };
}
