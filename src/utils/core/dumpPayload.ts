import FileSaver from 'file-saver';
import LzString from 'lz-string';
import { writeClipboardText } from './clipboard';

/** Copies a payload to the clipboard as pretty-ish JSON. */
export const dumpPayloadToClipboard = (payload: unknown): Promise<void> => (
  writeClipboardText(JSON.stringify(payload))
);

/** Saves a payload as an LzString-compressed `<...nameParts>.bin.lz` download. */
export const dumpPayloadToFile = (
  payload: unknown,
  nameParts: (string | number)[],
): void => {
  const compressed = LzString.compressToUint8Array(JSON.stringify(payload));
  const blob = new Blob([compressed as Uint8Array<ArrayBuffer>]);

  FileSaver.saveAs(blob, [...nameParts, 'bin', 'lz'].filter(Boolean).join('.'));
};
