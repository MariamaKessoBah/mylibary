export const BOOK_STATUS = {
  TO_READ: 'to_read',
  READING: 'reading',
  READ: 'read'
};

export const BOOK_STATUS_LABELS = {
  [BOOK_STATUS.TO_READ]: 'À lire',
  [BOOK_STATUS.READING]: 'En cours',
  [BOOK_STATUS.READ]: 'Lu'
};

export const BOOK_STATUS_COLORS = {
  [BOOK_STATUS.TO_READ]: 'bg-yellow-100 text-yellow-800',
  [BOOK_STATUS.READING]: 'bg-blue-100 text-blue-800',
  [BOOK_STATUS.READ]: 'bg-green-100 text-green-800'
};