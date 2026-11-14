/** Web preview uses a distinct demo origin and namespaced keys, never native credentials. */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    sessionStorage.setItem(key, value);
  },
  async remove(key: string): Promise<void> {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(key);
  },
};
