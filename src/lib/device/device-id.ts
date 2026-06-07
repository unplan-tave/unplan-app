import { STORAGE_KEYS } from '@/constants';
import { secureStorage } from '@/lib/storage/secure-storage';

function createFallbackDeviceId(): string {
  return `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function createDeviceId(): string {
  return globalThis.crypto?.randomUUID?.() ?? createFallbackDeviceId();
}

export async function getDeviceId(): Promise<string> {
  const storedDeviceId = await secureStorage.get(STORAGE_KEYS.DEVICE_ID);

  if (storedDeviceId) {
    return storedDeviceId;
  }

  const deviceId = createDeviceId();
  await secureStorage.set(STORAGE_KEYS.DEVICE_ID, deviceId);

  return deviceId;
}
