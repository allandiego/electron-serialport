import { resolve } from 'path';
import { Tray } from 'electron';

const iconPath = resolve('..', 'assets', 'tray', 'tray.png');

export const createTray = (): Tray => {
  // console.log(iconPath);
  const tray = new Tray(iconPath);
  tray.setToolTip('App');

  return tray;
};
