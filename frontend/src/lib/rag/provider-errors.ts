export type ProviderError = Error & { status?: number };

export function isQuotaOrRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as ProviderError;
  const status = err.status;
  if (status === 429 || status === 503) return true;

  const message = (err.message ?? String(error)).toLowerCase();
  return (
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('resource exhausted') ||
    message.includes('too many requests') ||
    message.includes('limit reached')
  );
}

/** Groq errors that should silently fall back to Gemini instead of failing the request. */
export function shouldFallbackFromGroq(error: unknown): boolean {
  if (isQuotaOrRateLimitError(error)) return true;
  if (!error || typeof error !== 'object') return false;

  const err = error as ProviderError;
  if (err.status === 404) return true;

  const message = (err.message ?? String(error)).toLowerCase();
  return (
    message.includes('model_not_found') ||
    message.includes('does not exist') ||
    message.includes('no longer available')
  );
}

export function providerError(message: string, status?: number): ProviderError {
  const error = new Error(message) as ProviderError;
  if (status !== undefined) error.status = status;
  return error;
}
