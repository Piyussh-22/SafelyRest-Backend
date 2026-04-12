// Utility functions to normalize dates to IST midnight and calculate number of nights between two dates.
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

export const toISTMidnight = (date: string | Date): Date => {
  const ist = new Date(new Date(date).getTime() + IST_OFFSET);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET);
};

export const getNights = (
  checkIn: string | Date,
  checkOut: string | Date,
): number => {
  const start = toISTMidnight(checkIn);
  const end = toISTMidnight(checkOut);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};
