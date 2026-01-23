const DB_NAME = 'PurrfectBlocksDB';
const DB_VERSION = 2; // Updated to match GameStorage version
const STORE_NAME = 'playerSettings';

export interface PlayerSettings {
  id: string;
  name: string;
  uuid: string;
  volume?: number; // 0-100
  muted?: boolean;
  devMode?: boolean; // Show dev tools (audio test, sprite tester, extra details)
}

export class PlayerSettingsManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      let isResolved = false;

      request.onerror = () => {
        if (isResolved) return;
        isResolved = true;
        console.error('Failed to open IndexedDB for player settings:', request.error);
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        if (isResolved) return;
        isResolved = true;
        this.db = request.result;
        console.log('PlayerSettings DB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('PlayerSettings onupgradeneeded fired');
        const db = (event.target as IDBOpenDBRequest).result;

        // Create playerSettings store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          console.log('Created playerSettings object store');
        }
      };

      request.onblocked = () => {
        console.warn('PlayerSettings DB open blocked - close other tabs');
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error('PlayerSettings DB initialization timeout'));
        }
      }, 10000);
    });
  }

  async getPlayerSettings(playerId: string = 'default'): Promise<PlayerSettings | null> {
    if (!this.db) {
      await this.init();
    }

    // Check if object store exists
    if (!this.db || !this.db.objectStoreNames.contains(STORE_NAME)) {
      console.warn('PlayerSettings object store does not exist');
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(playerId);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          console.error('Failed to get player settings:', request.error);
          reject(new Error('Failed to get player settings'));
        };
      } catch (error) {
        console.error('Error accessing player settings:', error);
        resolve(null);
      }
    });
  }

  async savePlayerSettings(settings: PlayerSettings): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    // Check if object store exists
    if (!this.db || !this.db.objectStoreNames.contains(STORE_NAME)) {
      console.warn('PlayerSettings object store does not exist, cannot save');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(settings);

        request.onsuccess = () => {
          console.log('Player settings saved successfully');
          resolve();
        };

        request.onerror = () => {
          console.error('Failed to save player settings:', request.error);
          reject(new Error('Failed to save player settings'));
        };
      } catch (error) {
        console.error('Error saving player settings:', error);
        reject(error);
      }
    });
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
