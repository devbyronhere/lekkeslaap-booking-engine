import { useBookingStore } from '@/Stores/useBookingStore';

describe('useBookingStore', () => {
  beforeEach(() => {
    useBookingStore.getState().reset();
  });

  it('initializes with default state', () => {
    const state = useBookingStore.getState();
    expect(state.currentStep).toBe(1);
    expect(state.checkIn).toBeNull();
    expect(state.checkOut).toBeNull();
    expect(state.rooms).toEqual([]);
    expect(state.specialRequests).toBe('');
    expect(state.bookingId).toBeNull();
  });

  it('sets and retrieves dates', () => {
    useBookingStore.getState().setDates('2026-04-01', '2026-04-04');
    const state = useBookingStore.getState();
    expect(state.checkIn).toBe('2026-04-01');
    expect(state.checkOut).toBe('2026-04-04');
  });

  it('sets and retrieves room selections', () => {
    const rooms = [
      { unitId: 1, quantity: 2, guests: 2 },
      { unitId: 2, quantity: 1, guests: 4 },
    ];
    useBookingStore.getState().setRooms(rooms);
    expect(useBookingStore.getState().rooms).toEqual(rooms);
  });

  it('sets special requests', () => {
    useBookingStore.getState().setSpecialRequests('Late check-in please');
    expect(useBookingStore.getState().specialRequests).toBe('Late check-in please');
  });

  it('sets booking id', () => {
    useBookingStore.getState().setBookingId(42);
    expect(useBookingStore.getState().bookingId).toBe(42);
  });

  describe('step navigation', () => {
    it('navigates to next step', () => {
      useBookingStore.getState().nextStep();
      expect(useBookingStore.getState().currentStep).toBe(2);
    });

    it('navigates to previous step', () => {
      useBookingStore.getState().goToStep(3);
      useBookingStore.getState().prevStep();
      expect(useBookingStore.getState().currentStep).toBe(2);
    });

    it('goes to a specific step', () => {
      useBookingStore.getState().goToStep(4);
      expect(useBookingStore.getState().currentStep).toBe(4);
    });

    it('clamps nextStep at upper bound (5)', () => {
      useBookingStore.getState().goToStep(5);
      useBookingStore.getState().nextStep();
      expect(useBookingStore.getState().currentStep).toBe(5);
    });

    it('clamps prevStep at lower bound (1)', () => {
      useBookingStore.getState().prevStep();
      expect(useBookingStore.getState().currentStep).toBe(1);
    });
  });

  it('reset clears all state', () => {
    useBookingStore.getState().setDates('2026-04-01', '2026-04-04');
    useBookingStore.getState().setRooms([{ unitId: 1, quantity: 1, guests: 2 }]);
    useBookingStore.getState().setSpecialRequests('Test');
    useBookingStore.getState().setBookingId(99);
    useBookingStore.getState().nextStep();

    useBookingStore.getState().reset();
    const state = useBookingStore.getState();

    expect(state.currentStep).toBe(1);
    expect(state.checkIn).toBeNull();
    expect(state.checkOut).toBeNull();
    expect(state.rooms).toEqual([]);
    expect(state.specialRequests).toBe('');
    expect(state.bookingId).toBeNull();
  });
});
