import { remote } from 'electron';

export async function showOpenDialogFile(
  defaultPath: string,
): Promise<string | null> {
  const dialogResponse = await remote.dialog.showOpenDialog({
    title: 'Selecione a pasta',
    buttonLabel: 'Selecionar',
    defaultPath: defaultPath ?? undefined,
    properties: ['openFile'],
  });

  if (dialogResponse.filePaths.length >= 1 && !dialogResponse.canceled) {
    return dialogResponse.filePaths[0];
  }
  return null;
}

export async function showOpenDialogDirectory(
  defaultPath: string,
): Promise<string | null> {
  const dialogResponse = await remote.dialog.showOpenDialog({
    title: 'Selecione a pasta',
    buttonLabel: 'Selecionar',
    defaultPath: defaultPath ?? undefined,
    properties: ['openDirectory'],
  });

  if (dialogResponse.filePaths.length >= 1 && !dialogResponse.canceled) {
    return dialogResponse.filePaths[0];
  }
  return null;
}
