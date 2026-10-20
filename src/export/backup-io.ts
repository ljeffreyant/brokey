import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { BackupData, backupFileName, buildBackup } from '../core';
import { useStore } from '../store';
import { ShareUnavailable } from './share';

/** Everything the app stores, as it is right now. */
export function currentBackupData(): BackupData {
  const s = useStore.getState();
  return {
    settings: s.settings,
    wallets: s.wallets,
    purchases: s.purchases,
    wishes: s.wishes,
    shame: s.shame,
    customCats: s.customCats,
    hiddenCats: s.hiddenCats,
    recentRoasts: s.recentRoasts,
    seenStickers: s.seenStickers,
  };
}

/** Builds the backup file and opens the share sheet (Save to Files, AirDrop, iCloud Drive...). On the web it downloads. */
export async function saveBackup(now = Date.now()): Promise<void> {
  // stamp first, so the file itself knows when it was made
  useStore.getState().updateSettings({ lastBackupTs: now });
  const json = buildBackup(currentBackupData(), now);
  const name = backupFileName(now);
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new ShareUnavailable();
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(json);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: name });
}

/** Lets the user pick a file and returns its text, or null if they cancelled. */
export async function pickBackupText(): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.length) return null;
  const a = res.assets[0];
  if (Platform.OS === 'web' && a.file) return await a.file.text();
  return await new File(a.uri).text();
}
