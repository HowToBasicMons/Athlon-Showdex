/**
 * @file `writeTeledexDb.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.1
 */

import { type TeledexRecord } from '@showdex/utils/debug';
import { env, nonEmptyObject } from '@showdex/utils/core';
import { logger, runtimer } from '@showdex/utils/debug';
import { showdexedDb } from './openIndexedDb';

const teledexName = env('indexed-db-teledex-store-name');
const l = logger('@showdex/utils/storage/writeTeledexDb()');

/**
 * Writes an array of `TeledexRecord`'s to Showdex's IndexedDB teledex store.
 *
 * * Never rejects; logging must not break the app.
 *
 * @since 1.3.1
 */
export const writeTeledexDb = (
  records: TeledexRecord[],
  config?: {
    db?: IDBDatabase;
  },
): Promise<void> => new Promise((
  resolve,
) => {
  const endTimer = runtimer(l.scope, l);
  const db = config?.db || showdexedDb.value;

  if (!teledexName || typeof db?.transaction !== 'function' || !records?.length) {
    endTimer('(bad args)');
    resolve();

    return;
  }

  const txn = db.transaction(teledexName, 'readwrite');
  const store = txn.objectStore(teledexName);

  records.forEach((record) => {
    if (nonEmptyObject(record) && record.id) {
      store.put(record);
    }
  });

  txn.oncomplete = () => {
    endTimer('(done)', '\n', '#records', records.length);
    resolve();
  };

  txn.onerror = () => resolve(); // never reject; logging must not break the app
});
