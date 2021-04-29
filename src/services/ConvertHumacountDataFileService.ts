import fs from 'fs';
import ptBR, { format } from 'date-fns';

import { LogEmitter } from '../utils/LogEmitter';
import { appendDataToFile } from '../utils/file';

function extractRecordsFromFile(filePath: string): string[][] {
  try {
    const fileData = fs.readFileSync(filePath);

    const fileLines = fileData.toString().split('\u0004'); // <EOT>, 4 \u0004

    const records = fileLines
      .filter((line, i) => {
        return i % 2 !== 0; // remove even lines = headers
      })
      .map(line => {
        return line.split('\r\n'); // split record lines
      });

    return records;
  } catch (error) {
    LogEmitter.emit('log', { message: error });
  }

  return [];
}

interface JsonRecord {
  key: string;
  data: {
    value: string;
    flag?: string;
  };
}

function recordsToJson(records: string[][]) {
  // index lines from record that contain valuable data
  const dataLinesIndex = [
    10,
    11,
    12,
    13,
    18,
    19,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
  ];

  const jsonRecords = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const record of records) {
    const jsonRecord = record
      .filter((line, i) => dataLinesIndex.includes(i))
      .map(line => {
        const lineSplit = line.split('\t');
        const key = lineSplit[0] ? lineSplit[0].trim() : '';
        const value1 = lineSplit[1] ? lineSplit[1].trim() : '';
        const value2 = lineSplit[2] ? lineSplit[2].trim() : '';

        if (lineSplit.length >= 3) {
          return { key, data: { value: value2, flag: value1 } };
        }

        return { key, data: { value: value1 } };
      });

    jsonRecords.push(jsonRecord);
  }

  return jsonRecords;
}

function recordToArray(jsonRecord: any) {
  // const recordSequenceIndex = [1, 6, 13, 14, 15, 16, 17, 18, 21, 22, 23, 25, 24, 20, 19, 7, 8, 9, 10, 11, 12, 26, 27]
  function formatDate(date: string) {
    return date
      ? `${date.substring(6, 8)}/${date.substring(4, 6)}/${date.substring(
          0,
          4,
        )}`
      : date;
  }

  function formatTime(time: string) {
    return time ? `${time.substring(0, 2)}:${time.substring(2, 4)}` : time;
  }

  function decodeType(typeOption: string) {
    return typeOption
      ? { Dog: 'Cão', Cat: 'Gato', Human: 'Humano' }[typeOption]
      : typeOption;
  }

  const line = [
    jsonRecord[0].data.value,
    formatDate(jsonRecord[4].data.value),
    formatTime(jsonRecord[5].data.value),
    jsonRecord[1].data.value,
    jsonRecord[6].data.value,
    jsonRecord[6].data.flag,
    jsonRecord[13].data.value,
    jsonRecord[13].data.flag,
    jsonRecord[14].data.value,
    jsonRecord[14].data.flag,
    jsonRecord[15].data.value,
    jsonRecord[15].data.flag,
    jsonRecord[16].data.value,
    jsonRecord[16].data.flag,
    jsonRecord[17].data.value,
    jsonRecord[17].data.flag,
    jsonRecord[18].data.value,
    jsonRecord[18].data.flag,
    jsonRecord[21].data.value,
    jsonRecord[21].data.flag,
    jsonRecord[22].data.value,
    jsonRecord[22].data.flag,
    jsonRecord[23].data.value,
    jsonRecord[23].data.flag,
    jsonRecord[25].data.value,
    jsonRecord[25].data.flag,
    jsonRecord[24].data.value,
    jsonRecord[24].data.flag,
    jsonRecord[20].data.value,
    jsonRecord[20].data.flag,
    jsonRecord[19].data.value,
    jsonRecord[19].data.flag,
    jsonRecord[7].data.value,
    jsonRecord[7].data.flag,
    jsonRecord[8].data.value,
    jsonRecord[8].data.flag,
    jsonRecord[9].data.value,
    jsonRecord[9].data.flag,
    jsonRecord[10].data.value,
    jsonRecord[10].data.flag,
    jsonRecord[11].data.value,
    jsonRecord[11].data.flag,
    jsonRecord[12].data.value,
    jsonRecord[12].data.flag,
    jsonRecord[26].data.value,
    jsonRecord[26].data.flag,
    jsonRecord[27].data.value,
    jsonRecord[27].data.flag,
    decodeType(jsonRecord[3].data.value),
    jsonRecord[28].data.value,
    '0',
    '0',
    '0',
    '0',
    '0',
  ];
  return line;
}

async function createOutputFile(outputFilePath: string, jsonRecords: any) {
  try {
    const outputHeader = [
      'ID da amostra',
      'Data',
      'Tempo',
      'ID Paciente',
      'WBC',
      'WBC flags',
      'RBC',
      'RBC flags',
      'HGB',
      'HGB flags',
      'HCT',
      'HCT flags',
      'MCV',
      'MCV flags',
      'MCH',
      'MCH flags',
      'MCHC',
      'MCHC flags',
      'PLT',
      'PLT flags',
      'PCT',
      'PCT flags',
      'MPV',
      'MPV flags',
      'PDWs',
      'PDWs flags',
      'PDWc',
      'PDWc flags',
      'RDWs',
      'RDWs flags',
      'RDWc',
      'RDWc flags',
      'LYM',
      'LYM flags',
      'MON',
      'MON flags',
      'GRA',
      'GRA flags',
      'LYM%',
      'LYM% flags',
      'MON%',
      'MON% flags',
      'GRA%',
      'GRA% flags',
      'P-LCC',
      'P-LCC flags',
      'P-LCR',
      'P-LCR flags',
      'Tipo',
      'Atenção',
      'RBC probe min',
      'RBC probe max',
      'WBC probe min',
      'WBC probe max',
      'Lisante',
    ];

    await appendDataToFile(outputFilePath, `${outputHeader.join('\t')}\t\r\n`);

    // eslint-disable-next-line no-restricted-syntax
    for (const jsonRecord of jsonRecords) {
      // eslint-disable-next-line no-await-in-loop
      await appendDataToFile(
        outputFilePath,
        `${recordToArray(jsonRecord).join('\t')}\t\r\n`,
      );
    }
  } catch (error) {
    LogEmitter.emit('log', { message: error });
  }
}

export async function formatedLayoutToArray(
  filePath: string,
): Promise<string[][]> {
  try {
    const fileData = fs.readFileSync(filePath);

    const fileLines = fileData.toString().split('\t\r\n');

    const data = fileLines
      .filter((line, index) => {
        return line !== '' && index !== 0; // remove first line (header) last line (blank)
      })
      .map((line, index) => {
        const splitedLine = line.split('\t');
        splitedLine.unshift(`${index + 1}`);
        return splitedLine;
      });

    return data;
  } catch (error) {
    LogEmitter.emit('log', { message: error });
  }

  return [];
}

interface ServiceInput {
  filePath: string;
  outputPath: string;
}

export default class ConvertHumacountDataFileService {
  public async execute({ filePath, outputPath }: ServiceInput): Promise<void> {
    try {
      const fileDate = format(new Date(), 'yyyy-MM-dd__HH_mm_ss', {
        locale: ptBR,
      });

      if (!fs.existsSync(filePath)) {
        return;
        // throw new Error(`Arquivo raw não encontrado ${filePath}`);
      }

      const outputFilePath = `${outputPath}/${fileDate}_dados.txt`;
      const records = extractRecordsFromFile(filePath);
      const jsonRecords = recordsToJson(records);
      await createOutputFile(outputFilePath, jsonRecords);

      fs.unlinkSync(filePath);
    } catch (error) {
      LogEmitter.emit('log', { message: error });
    }
  }
}
