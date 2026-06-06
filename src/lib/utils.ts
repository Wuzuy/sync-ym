export const getDeviceFingerprint = (): string => {
  let fingerprint = localStorage.getItem('device_fingerprint');
  if (!fingerprint) {
    // Gera um fingerprint usando crypto.randomUUID se disponível, ou fallback para uma string aleatória
    fingerprint = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    localStorage.setItem('device_fingerprint', fingerprint);
  }
  return fingerprint;
};
