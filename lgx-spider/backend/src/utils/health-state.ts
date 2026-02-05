let healthy = true;
let pendingRequests = 0;

export const setHealthy = (value: boolean): void => {
  healthy = value;
};

export const isHealthy = (): boolean => healthy;

export const incrementPendingRequests = (): void => {
  pendingRequests += 1;
};

export const decrementPendingRequests = (): void => {
  pendingRequests -= 1;
};

export const getPendingRequests = (): number => pendingRequests;
