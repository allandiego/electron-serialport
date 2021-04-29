import SerialPort from 'serialport';

import { LogEmitter } from '../utils/LogEmitter';

export interface SerialPortInfo {
  value: string;
  text: string;
}

export async function listSerialPorts(): Promise<SerialPortInfo[]> {
  try {
    const portData = await SerialPort.list();

    const portList = portData
      .filter(
        port =>
          port.path.toUpperCase().includes('COM') ||
          port.path.toUpperCase().includes('USB'),
      )
      .map(port => ({
        value: port.path,
        text: `(${port.path}) - ${port.manufacturer}`,
      }));

    return portList;
  } catch (error) {
    LogEmitter.emit('log', { message: error });
  }

  return [];
}

export async function connectToSerialPort(
  portId: string,
  baudRate: number,
): Promise<SerialPort> {
  const serialPort = new SerialPort(portId, {
    baudRate,
    // dataBits: 8,
    // autoOpen: false
  });

  return serialPort;
}

export async function closeSerialPort(
  serialPort: SerialPort,
  cb: () => Promise<void>,
): Promise<void> {
  try {
    if (serialPort?.isOpen) {
      serialPort.close(cb);
    }
  } catch (error) {
    LogEmitter.emit('log', { message: error });
  }
}

export async function listenSerialPort(
  serialPort: SerialPort,
  cb: (data: string) => void,
): Promise<void> {
  serialPort.on('data', data => {
    // console.log('serial data', data.toString());
    cb(data.toString());
  });

  serialPort.on('error', error => {
    LogEmitter.emit('log', { message: error });
  });
}
