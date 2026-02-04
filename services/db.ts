
/**
 * GFITLIFE INDEXED-DB WRAPPER V3.0
 * Objetivo: Fonte única de verdade para persistência local (cache) do ecossistema.
 * Este arquivo lida EXCLUSIVAMENTE com o IndexedDB do navegador.
 */

const DB_NAME = 'gfitlife_db_v3';
// Incrementing version to add new stores for full feature support
const DB_VERSION = 4;

/**
 * Inicializa o banco de dados local.
 * IMPORTANTE: NUNCA importe chaves de serviço ou o cliente admin do Supabase aqui.
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      const stores = [
        'users', 'config', 'products', 'orders', 'banners', 'leads', 'coupons', 
        'chat_sessions', 'api_configs', 'sellers', 'audit_logs', 'security_events', 
        'deploys', 'backups', 'consents', 'lgpd_logs', 'pwa_notifications', 
        'sync_logs', 'wa_messages', 'ai_recommendations', 'ai_automations', 
        'ai_logs', 'ai_predictions', 'gateways', 'transactions', 'carriers', 
        'deliveries', 'departments', 'categories', 'performance_metrics', 'roles',
        'remarketing_logs', 'email_templates'
      ];
      
      stores.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          const keyPath = store === 'config' ? 'key' : 'id';
          db.createObjectStore(store, { keyPath });
          console.log(`[DB-LOCAL] Store ${store} preparada (key: ${keyPath}).`);
        }
      });
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject('Falha crítica ao acessar IndexedDB');
  });
};

export const dbStore = {
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(`Erro ao ler ${storeName}`);
    });
  },

  async put<T>(storeName: string, data: T): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const keyPath = store.keyPath as string;
      if (!(data as any)[keyPath]) {
         console.error(`[DB-LOCAL-ERROR] Falta campo obrigatório ${keyPath} em ${storeName}.`, data);
         return reject(`Objeto inválido para store ${storeName}`);
      }
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(`Erro ao persistir em ${storeName}`);
    });
  },

  async delete(storeName: string, id: string): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(`Erro ao remover de ${storeName}`);
    });
  },

  async getByKey<T>(storeName: string, key: string): Promise<T | null> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(`Erro ao buscar chave ${key}`);
    });
  }
};
