// Circuit Breaker Pattern Implementation
// Prevents cascading failures by temporarily disabling failing services

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN' // Testing if service has recovered
}

class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttempt: number = 0;

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        console.log('Circuit breaker is OPEN, using fallback');
        if (fallback) {
          return await fallback();
        }
        throw new Error('Circuit breaker is OPEN and no fallback provided');
      } else {
        this.state = CircuitBreakerState.HALF_OPEN;
        console.log('Circuit breaker moving to HALF_OPEN state');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        console.log('Operation failed, using fallback');
        return await fallback();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitBreakerState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttempt = Date.now() + this.options.resetTimeout;
      console.log(`Circuit breaker OPENED after ${this.failureCount} failures`);
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

// Create circuit breaker instances for different services
export const supabaseCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,     // Open after 5 failures
  resetTimeout: 30000,     // Try again after 30 seconds
  monitoringPeriod: 60000  // Monitor for 1 minute
});

export const geolocationCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,     // Open after 3 failures
  resetTimeout: 60000,     // Try again after 1 minute
  monitoringPeriod: 120000 // Monitor for 2 minutes
});

export const analyticsCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,     // Open after 5 failures
  resetTimeout: 15000,     // Try again after 15 seconds
  monitoringPeriod: 60000  // Monitor for 1 minute
});

// Helper function to use circuit breakers
export const withCircuitBreaker = async <T>(
  circuitBreaker: CircuitBreaker,
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> => {
  return await circuitBreaker.execute(operation, fallback);
};

// Export circuit breaker states for external use
export { CircuitBreakerState };