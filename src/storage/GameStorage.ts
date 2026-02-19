// IndexedDB storage for game state persistence with localStorage fallback

export interface SavedGameState {
  board: number[][];
  score: number;
  streakLevel: number;
  availablePieces: any[];
  timestamp: number;
}

export class GameStorage {
  private dbName = 'PurrfectBlocksDB';
  private dbVersion = 3; // Incremented to force clean database recreation
  private storeName = 'gameState';
  private db: IDBDatabase | null = null;
  private useLocalStorage: boolean = true; // Use localStorage by default to avoid IndexedDB blocking issues
  private localStorageKey: string = 'purrfectBlocks_gameState';

  /**
   * Initialize storage - now uses localStorage by default
   * This method will NEVER throw
   */
  async init(): Promise<void> {
    // Use localStorage directly - simpler and avoids IndexedDB blocking issues
    console.log('[GameStorage] Using localStorage for game state');
    this.useLocalStorage = true;

    // Verify localStorage is actually available
    try {
      localStorage.setItem('[GameStorage] test', 'test');
      localStorage.removeItem('[GameStorage] test');
      console.log('[GameStorage] Storage initialized successfully (using ' + (this.useLocalStorage ? 'localStorage' : 'IndexedDB') + ')');
    } catch (storageError) {
      console.error('[GameStorage] CRITICAL: localStorage is not available!', storageError);
      // Even if localStorage fails, we don't throw - game can still work without persistence
    }
  }

  /**
   * Migrate data from IndexedDB to localStorage (if available)
   */
  private async migrateToLocalStorage(): Promise<void> {
    try {
      if (this.db) {
        const savedData = await this.loadGame();
        if (savedData) {
          localStorage.setItem(this.localStorageKey, JSON.stringify(savedData));
          console.log('[GameStorage] Migrated data to localStorage');
        }
      }
    } catch (error) {
      console.warn('[GameStorage] Could not migrate to localStorage:', error);
    }
  }

  /**
   * Initialize IndexedDB connection
   */
  private initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('[GameStorage] Opening IndexedDB:', this.dbName, 'version:', this.dbVersion);
      const request = indexedDB.open(this.dbName, this.dbVersion);

      let isResolved = false;
      let timeoutId: number | null = null;

      const cleanup = () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      request.onerror = () => {
        if (isResolved) return;
        isResolved = true;
        cleanup();
        console.error('IndexedDB failed to open:', request.error);
        reject(request.error);
      };

      request.onblocked = () => {
        console.warn('IndexedDB open blocked - close other tabs or wait...');
        // Don't reject immediately, give it more time
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            console.error('IndexedDB blocked timeout - database may be open in another tab');
            reject(new Error('Database blocked: Please close other tabs with this app open'));
          }
        }, 10000); // Give 10 seconds for blocked state
      };

      request.onsuccess = () => {
        if (isResolved) return;
        isResolved = true;
        cleanup();
        console.log('IndexedDB onsuccess fired');
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('IndexedDB onupgradeneeded fired for GameStorage');
        const db = (event.target as IDBOpenDBRequest).result;

        // Delete old object store if it exists (clean slate for new version)
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
          console.log('Deleted old game state object store');
        }

        // Create fresh object store
        db.createObjectStore(this.storeName, { keyPath: 'id' });
        console.log('Created new game state object store');
      };

      // Timeout after 10 seconds (increased from 5)
      timeoutId = window.setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          console.error('IndexedDB initialization timeout - forcing rejection');
          reject(new Error('Database initialization timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Save current game state (IndexedDB or localStorage)
   */
  async saveGame(state: SavedGameState): Promise<void> {
    if (this.useLocalStorage) {
      // Use localStorage fallback
      try {
        localStorage.setItem(this.localStorageKey, JSON.stringify(state));
        console.log('[GameStorage] Game saved to localStorage');
      } catch (error) {
        console.error('[GameStorage] Failed to save to localStorage:', error);
        throw error;
      }
      return;
    }

    // Use IndexedDB
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Check if object store exists before attempting transaction
    if (!this.db.objectStoreNames.contains(this.storeName)) {
      console.warn('[GameStorage] Object store does not exist, database may be corrupted');
      throw new Error('Database corrupted: object store missing');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Always use same ID to overwrite previous save
      const saveData = {
        id: 'current',
        ...state
      };

      const request = store.put(saveData);

      request.onsuccess = () => {
        console.log('[GameStorage] Game saved to IndexedDB');
        resolve();
      };

      request.onerror = () => {
        console.error('[GameStorage] Failed to save to IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Load saved game state (IndexedDB or localStorage)
   */
  async loadGame(): Promise<SavedGameState | null> {
    if (this.useLocalStorage) {
      // Use localStorage fallback
      try {
        const data = localStorage.getItem(this.localStorageKey);
        if (data) {
          console.log('[GameStorage] Game loaded from localStorage');
          return JSON.parse(data);
        } else {
          console.log('[GameStorage] No saved game in localStorage');
          return null;
        }
      } catch (error) {
        console.error('[GameStorage] Failed to load from localStorage:', error);
        return null;
      }
    }

    // Use IndexedDB
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Check if object store exists before attempting transaction
    if (!this.db.objectStoreNames.contains(this.storeName)) {
      console.warn('[GameStorage] Object store does not exist, database may be corrupted');
      throw new Error('Database corrupted: object store missing');
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get('current');

        request.onsuccess = () => {
          if (request.result) {
            console.log('[GameStorage] Game loaded from IndexedDB');
            resolve(request.result);
          } else {
            console.log('[GameStorage] No saved game in IndexedDB');
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error('[GameStorage] Failed to load from IndexedDB:', request.error);
          reject(request.error);
        };

        transaction.onerror = () => {
          console.error('[GameStorage] Transaction error while loading game:', transaction.error);
          reject(transaction.error);
        };
      } catch (error) {
        console.error('[GameStorage] Error creating transaction:', error);
        reject(error);
      }
    });
  }

  /**
   * Delete saved game (IndexedDB or localStorage)
   */
  async deleteSave(): Promise<void> {
    if (this.useLocalStorage) {
      // Use localStorage fallback
      try {
        localStorage.removeItem(this.localStorageKey);
        console.log('[GameStorage] Saved game deleted from localStorage');
      } catch (error) {
        console.error('[GameStorage] Failed to delete from localStorage:', error);
        throw error;
      }
      return;
    }

    // Use IndexedDB
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete('current');

      request.onsuccess = () => {
        console.log('[GameStorage] Saved game deleted from IndexedDB');
        resolve();
      };

      request.onerror = () => {
        console.error('[GameStorage] Failed to delete from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Check if a saved game exists
   */
  async hasSavedGame(): Promise<boolean> {
    const save = await this.loadGame();
    return save !== null;
  }

  /**
   * Reset database (useful for fixing corruption issues)
   */
  async resetDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close();
        this.db = null;
      }

      // Increment version to force upgrade
      this.dbVersion++;
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);

      deleteRequest.onsuccess = async () => {
        console.log('Database deleted successfully');
        try {
          await this.init();
          resolve();
        } catch (error) {
          console.error('Failed to reinitialize after deletion:', error);
          reject(error);
        }
      };

      deleteRequest.onerror = () => {
        console.error('Failed to delete database:', deleteRequest.error);
        // Even if deletion fails, try to reinitialize
        this.init().then(resolve).catch(reject);
      };

      deleteRequest.onblocked = () => {
        console.warn('Database deletion blocked. Attempting to reinitialize anyway...');
        // If blocked, wait a bit and try to reinitialize
        setTimeout(() => {
          this.init().then(resolve).catch(reject);
        }, 100);
      };
    });
  }
}
