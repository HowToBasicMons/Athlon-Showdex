import FileSaver from 'file-saver';
import LzString from 'lz-string';
import { writeClipboardText } from './clipboard';
import { safeStringify } from './safeStringify';

/** Copies a payload to the clipboard as JSON (circular-safe — a battle's logged Showdown objects are cyclic). */
export const dumpPayloadToClipboard = (payload: unknown): Promise<void> => (
  writeClipboardText(safeStringify(payload))
);

/** Saves a payload as an LzString-compressed `<...nameParts>.bin.lz` download (circular-safe). */
export const dumpPayloadToFile = (
  payload: unknown,
  nameParts: (string | number)[],
): void => {
  const compressed = LzString.compressToUint8Array(safeStringify(payload));
  const blob = new Blob([compressed as Uint8Array<ArrayBuffer>]);

  FileSaver.saveAs(blob, [...nameParts, 'bin', 'lz'].filter(Boolean).join('.'));
};
