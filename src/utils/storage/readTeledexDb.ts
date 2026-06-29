/**
 * @file `readTeledexDb.ts`
 * @author Keith Choison <keith@tize.io>
 * @since 1.3.1
 */

import { type TeledexRecord } from '@showdex/utils/debug';
import { env } from '@showdex/utils/core';
import { logger, runtimer } from '@showdex/utils/debug';
import { showdexedDb } from './openIndexedDb';

const teledexName = env('indexed-db-teledex-store-name');
const l = logger('@showdex/utils/storage/readTeledexDb()');

/**
 * Reads from Showdex's IndexedDB teledex store & returns all stored records, oldest-first.
 *
 * * Guaranteed to return an empty array.
 *
 * @since 1.3.1
 */
export const readTeledexDb = (
  config?: {
    db?: IDBDatabase;
  },
): Promise<TeledexRecord[]> => new Promise((
  resolve,
) => {
  const endTimer = runtimer(l.scope, l);
  const db = config?.db || showdexedDb.value;
  const output: TeledexRecord[] = [];

  if (!teledexName || typeof db?.transaction !== 'function') {
    endTimer('(bad args)');
    resolve(output);

    return;
  }

  const store = db.transaction(teledexName).objectStore(teledexName);
  const req = store.index('ts').openCursor();

  req.onsuccess = (event) => {
    const cursor = (event.target as typeof req).result;

    if (!cursor) {
      endTimer('(done)', '\n', '#records', output.length);
      resolve(output);

      return;
    }

    output.push(cursor.value as TeledexRecord);
    cursor.continue();
  };

  req.onerror = () => resolve(output);
});
