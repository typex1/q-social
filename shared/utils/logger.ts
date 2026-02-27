export function logError(context: string, error: unknown) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : '';
  
  console.error(JSON.stringify({
    timestamp,
    context,
    error: errorMessage,
    stack
  }));
}
