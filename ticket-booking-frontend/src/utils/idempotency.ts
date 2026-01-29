import { v4 as uuidv4 } from 'uuid';

// Gets existing key or creates a new one for this session
export const getIdempotencyKey = (): string => {
  let key = sessionStorage.getItem('idempotency_key');
  if (!key) {
    key = uuidv4();
    sessionStorage.setItem('idempotency_key', key);
  }
  return key;
};

// Clears key after successful payment
export const clearIdempotencyKey = () => {
  sessionStorage.removeItem('idempotency_key');
};