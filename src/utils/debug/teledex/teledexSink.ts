// src/utils/debug/teledex/teledexSink.ts
import { dumpPayloadToClipboard, dumpPayloadToFile } from '@showdex/utils/core/dumpPayload';
import { pruneTeledexDb, readTeledexDb, writeTeledexDb } from '@showdex/utils/storage';
import { configureTeledex } from './teledex';

/**
 * Wires the IndexedDB mirror + flush backend into the `teledex` singleton.
 *
 * Lives OUTSIDE the logger→teledex import path (and is intentionally NOT re-exported from the
 * `@showdex/utils/debug` barrel), so importing the logger never drags the storage/clipboard chain
 * back into a cycle. Call this ONCE at boot, before any capture/flush occurs.
 *
 * @since 1.2.5
 */
export const wireTeledexSink = (): void => void configureTeledex({
  writeRecords: writeTeledexDb,
  readRecords: readTeledexDb,
  pruneRecords: pruneTeledexDb,
  dumpToFile: dumpPayloadToFile,
  dumpToClipboard: dumpPayloadToClipboard,
});
