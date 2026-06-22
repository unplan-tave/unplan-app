const SENSITIVE_KEY_PATTERN =
  /authorization|access[_-]?token|refresh[_-]?token|id[_-]?token|password|secret/i;

function redactSensitiveData(value: unknown, key = ''): unknown {
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return '[REDACTED]';
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redactSensitiveData(entryValue, entryKey),
      ]),
    );
  }

  return value;
}

function formatLogData(data: unknown): string {
  if (data === undefined || data === null || data === '') {
    return '<empty>';
  }

  return JSON.stringify(redactSensitiveData(data), null, 2);
}

export function logApiRequest(
  method: string | undefined,
  url: string | undefined,
  data: unknown,
  hasAuthorization: boolean,
) {
  if (!__DEV__) {
    return;
  }

  console.info(
    `[API Request] ${method?.toUpperCase() ?? 'UNKNOWN'} ${url ?? ''}\n` +
      `Authorization: ${hasAuthorization ? 'attached' : 'missing'}\n` +
      `Payload:\n${formatLogData(data)}`,
  );
}

export function logApiResponse(
  status: number | undefined,
  method: string | undefined,
  url: string | undefined,
  data: unknown,
) {
  if (!__DEV__) {
    return;
  }

  console.info(
    `[API Response] ${status ?? 'UNKNOWN'} ${method?.toUpperCase() ?? 'UNKNOWN'} ${url ?? ''}\n` +
      `Body:\n${formatLogData(data)}`,
  );
}
