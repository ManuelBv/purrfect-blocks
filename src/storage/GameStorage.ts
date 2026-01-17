// IndexedDB storage for game state persistence

export interface SavedGameState {
  board: number[][];
  score: number;
  combo: number;
  availablePieces: any[];
  timestamp: number;
}

export class GameStorage {
  private dbName = 'PurrfectBlocksDB';
  private dbVersion = 2; // Incremented to force clean database recreation
  private storeName = 'gameState';
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Opening IndexedDB:', this.dbName, 'version:', this.dbVersion);
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        reject(request.error);
      };

      request.onblocked = () => {
        console.warn('IndexedDB open blocked - close other tabs');
      };

      request.onsuccess = () => {
        console.log('IndexedDB onsuccess fired');
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('IndexedDB onupgradeneeded fired');
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
          console.log('Created game state object store');
        } else {
          console.log('Object store already exists');
        }
      };

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!this.db) {
          console.error('IndexedDB initialization timeout - forcing rejection');
          reject(new Error('Database initialization timeout'));
        }
      }, 5000);
    });
  }

  /**
   * Save current game state to IndexedDB
   */
  async saveGame(state: SavedGameState): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Check if object store exists before attempting transaction
    if (!this.db.objectStoreNames.contains(this.storeName)) {
      console.warn('Object store does not exist, database may be corrupted');
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
        console.log('Game saved successfully');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save game:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Load saved game state from IndexedDB
   */
  async loadGame(): Promise<SavedGameState | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Check if object store exists before attempting transaction
    if (!this.db.objectStoreNames.contains(this.storeName)) {
      console.warn('Object store does not exist, database may be corrupted');
      throw new Error('Database corrupted: object store missing');
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get('current');

        request.onsuccess = () => {
          if (request.result) {
            console.log('Game loaded successfully');
            resolve(request.result);
          } else {
            console.log('No saved game found');
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error('Failed to load game:', request.error);
          reject(request.error);
        };

        transaction.onerror = () => {
          console.error('Transaction error while loading game:', transaction.error);
          reject(transaction.error);
        };
      } catch (error) {
        console.error('Error creating transaction:', error);
        reject(error);
      }
    });
  }

  /**
   * Delete saved game from IndexedDB
   */
  async deleteSave(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete('current');

      request.onsuccess = () => {
        console.log('Saved game deleted');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete save:', request.error);
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
