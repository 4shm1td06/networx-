
export const rateLimit = (() => {
  const requests = new Map<string, number[]>();
  
  return (key: string, limit: number, windowMs: number): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const keyRequests = requests.get(key)!;
    
    // Remove old requests outside the window
    const filteredRequests = keyRequests.filter(time => time > windowStart);
    
    if (filteredRequests.length >= limit) {
      return false; // Rate limit exceeded
    }
    
    filteredRequests.push(now);
    requests.set(key, filteredRequests);
    
    return true; // Request allowed
  };
})();

export const sanitizeMessage = (message: string): string => {
  return message
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .trim()
    .substring(0, 1000); // Limit message length
};

export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const hashIdentityCode = (code: string): string => {
  // Simple hash function for demo - in production use proper crypto
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

export const isSecureContext = (): boolean => {
  return window.isSecureContext || location.protocol === 'https:';
};
