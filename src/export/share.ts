import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { PDF_PAGE } from './pdf';

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export const XLSX_UTI = 'org.openxmlformats.spreadsheetml.sheet';

export class ShareUnavailable extends Error {
  constructor() {
    super('sharing is not available on this device');
  }
}

/** A file name that is safe everywhere: letters, digits, dashes. Falls back when the name has none. */
export function exportFileName(parts: (string | number)[], ext: string): string {
  const clean = parts
    .map((p) => String(p).normalize('NFKD').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('-');
  return `${clean || 'Brokey'}.${ext}`;
}

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Writes bytes to the cache and opens the system share sheet. On the web it downloads instead. */
export async function shareXlsx(bytes: Uint8Array, name: string): Promise<void> {
  if (Platform.OS === 'web') {
    download(new Blob([bytes as BlobPart], { type: XLSX_MIME }), name);
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new ShareUnavailable();
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(bytes);
  await Sharing.shareAsync(file.uri, { mimeType: XLSX_MIME, UTI: XLSX_UTI, dialogTitle: name });
}

/** Prints the report HTML to a PDF file with the system print engine and opens the share sheet. */
export async function sharePdf(html: string, name: string): Promise<void> {
  if (Platform.OS === 'web') {
    const w = window.open('', '_blank');
    if (!w) throw new Error('popup blocked');
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new ShareUnavailable();
  const printed = await Print.printToFileAsync({ html, width: PDF_PAGE.width, height: PDF_PAGE.height, margins: { left: 0, top: 0, right: 0, bottom: 0 } });
  // the print engine picks a random file name; the share sheet shows it, so give it a proper one
  const dest = new File(Paths.cache, name);
  if (dest.exists) dest.delete();
  new File(printed.uri).copy(dest);
  await Sharing.shareAsync(dest.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: name });
}

/** Shares an image file that already exists on disk (used by the receipt). */
export async function shareImage(uri: string, name: string): Promise<void> {
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    download(await res.blob(), name);
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new ShareUnavailable();
  await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: name });
}
