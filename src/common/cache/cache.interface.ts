export interface ICacheProvider {
  set(key: string, value: string, expire?: number): Promise<void>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<void>;
}
