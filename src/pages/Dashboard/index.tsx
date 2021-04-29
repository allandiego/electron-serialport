import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { remote } from 'electron';
import store from 'electron-settings';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import SerialPort from 'serialport';
import ptBR, { format } from 'date-fns';

import {
  Box,
  makeStyles,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  CircularProgress,
  Button,
  IconButton,
  InputAdornment,
} from '@material-ui/core';
import { FiRefreshCw as RefreshIcon } from 'react-icons/fi';

import ConvertHumacountDataFileService from '../../services/ConvertHumacountDataFileService';
import { appendDataToFile } from '../../utils/file';
import Yup from '../../utils/validators/Yup';
import { getValidationErrors } from '../../utils/getErrors';
import { Page, TextInput, SelectInput } from '../../components';
import { useToast } from '../../hooks/toast';
import {
  SerialPortInfo,
  listSerialPorts,
  connectToSerialPort,
  listenSerialPort,
  closeSerialPort,
} from '../../hooks/serialPort';
import { LogEmitter } from '../../utils/LogEmitter';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.default,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
  selectAdornment: {
    marginRight: theme.spacing(3),
  },
}));

interface FormData {
  serialPortId: string;
  baudRate: number;
}

const Dashboard: React.FC = () => {
  const { addToast } = useToast();

  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [serialPortList, setSerialPortList] = useState<SerialPortInfo[]>([]);
  const [serialPort, setSerialPort] = useState<SerialPort>(null);
  const [outputFilePath, setOutputFilePath] = useState<string>(null);

  const formRef = useRef<FormHandles>(null);
  const formLogsRef = useRef<FormHandles>(null);

  // ipcRenderer.on('user-data-path', (e, data) => {
  //   console.log('user data', data);
  // });

  console.log(process.env);

  const handleInitSerialConnection = useCallback(
    async (data: FormData) => {
      try {
        setLoading(true);
        formRef.current?.setErrors({});

        if (
          !store.hasSync('outputPath') ||
          store.getSync('outputPath') === ''
        ) {
          throw new Error('A configuração de saída dos dados está vazia');
        }

        const schemaForm = Yup.object().shape({
          serialPortId: Yup.string().required('Campo obrigatório'),
          baudRate: Yup.number().required('Campo obrigatório'),
        });

        await schemaForm.validate(data, { abortEarly: false });

        const { serialPortId, baudRate } = data;

        // const mockPort = MockBinding.createPort(serialPortId, {
        //   echo: true,
        //   record: true,
        //   baudRate: 115200,
        // });

        const serialPortInstance = await connectToSerialPort(
          serialPortId,
          Number(baudRate),
        );

        const outputPath = store.getSync('outputPath');

        const fileDate = format(new Date(), 'yyyy-MM-dd__HH_mm_ss', {
          locale: ptBR,
        });

        const outputFile = `${outputPath}\\${fileDate}_raw.txt`;

        const onSerialDataReceived = async (comData: string) => {
          LogEmitter.emit('data', { data: comData });
          await appendDataToFile(outputFile, comData);
        };

        listenSerialPort(serialPortInstance, onSerialDataReceived);

        setOutputFilePath(outputFile);
        setSerialPort(serialPortInstance);

        addToast({
          type: 'success',
          title: 'Sucesso!',
          description: 'Conexão iniciada!',
        });
      } catch (error) {
        formLogsRef.current.setFieldValue(
          'logs',
          `${formLogsRef.current.getFieldValue('logs')}\n${error}`,
        );

        if (error instanceof Yup.ValidationError) {
          const errors = getValidationErrors(error);
          // console.log('Yup.ValidationError => ', error);

          formRef.current?.setErrors(errors);

          addToast({
            type: 'error',
            title: 'Erro',
            delay: 10000,
            description: 'Verifique os erros no formulário',
          });
          return;
        }

        addToast({
          type: 'error',
          title: 'Erro',
          delay: 10000,
          description: error,
        });
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  const handleCLoseSerialConnection = useCallback(async () => {
    try {
      if (serialPort?.isOpen) {
        const onSerialConnectionClosed = async () => {
          const convertHumacountDataFileService = new ConvertHumacountDataFileService();

          const outputPath = String(store.getSync('outputPath'));

          await convertHumacountDataFileService.execute({
            filePath: outputFilePath,
            outputPath,
          });
        };

        closeSerialPort(serialPort, onSerialConnectionClosed);

        setSerialPort(null);
        setOutputFilePath(null);
        LogEmitter.emit('reset');

        addToast({
          type: 'info',
          title: 'Info',
          delay: 10000,
          description: 'Conexão finalizada',
        });
      }
    } catch (error) {
      LogEmitter.emit('log', { message: error });
    }
  }, [addToast, outputFilePath, serialPort]);

  function handleSyncStoreOnValueChange(
    event: React.FocusEvent<HTMLInputElement> | any,
  ) {
    const input = event.target as HTMLInputElement;
    if (input?.value && input?.name) {
      store.setSync(input.name, input.value);
    }
  }

  const handleLoadSerialPorts = useCallback(async () => {
    try {
      setLoading(true);
      const ports = await listSerialPorts();
      setSerialPortList(ports);

      // addToast({
      //   type: 'info',
      //   title: 'Info',
      //   delay: 10000,
      //   description: 'Portais seriais atualizadas',
      // });
    } catch (error) {
      LogEmitter.emit('log', { message: error });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleLoadSerialPorts();
  }, [handleLoadSerialPorts]);

  useEffect(() => {
    LogEmitter.on('log', data => {
      formLogsRef.current.setFieldValue(
        'logs',
        `${formLogsRef.current.getFieldValue('logs')}\n${data.message}`,
      );
    });

    LogEmitter.on('reset', () => {
      formLogsRef.current.setFieldValue('logs', '');
      formLogsRef.current.setFieldValue('receivedData', '');
    });

    LogEmitter.on('data', data => {
      formLogsRef.current.setFieldValue(
        'receivedData',
        `${formLogsRef.current.getFieldValue('receivedData')}\n${data.data}`,
      );
    });

    return () => {
      LogEmitter.removeAllListeners();
    };
  }, []);

  // close serial port connnection
  useEffect(() => {
    return () => {
      handleCLoseSerialConnection();
    };
  }, [handleCLoseSerialConnection]);

  const initialFormData = {
    serialPortId: store.hasSync('serialPortId')
      ? String(store.getSync('serialPortId'))
      : '',
    baudRate: store.hasSync('baudRate')
      ? String(store.getSync('baudRate'))
      : '',
  };

  return (
    <Page className={classes.root}>
      <Container maxWidth="lg">
        <Grid container spacing={1}>
          <Grid item lg={12} md={12} xs={12}>
            {!loading ? (
              <Form
                ref={formRef}
                initialData={initialFormData}
                onSubmit={handleInitSerialConnection}
                autoComplete="off"
                noValidate
                // className={classes.root}
              >
                <Card>
                  <CardHeader title="Receber" subheader="Dados" />

                  <Divider />

                  <CardContent>
                    <Grid container spacing={1}>
                      <Grid item md={12} xs={12}>
                        <SelectInput
                          label="Porta Serial"
                          fullWidth
                          onChange={handleSyncStoreOnValueChange}
                          variant="outlined"
                          inputProps={{
                            name: 'serialPortId',
                            id: 'serialPortId',
                          }}
                          endAdornment={
                            <InputAdornment
                              className={classes.selectAdornment}
                              position="end"
                            >
                              <IconButton
                                onClick={handleLoadSerialPorts}
                                color="inherit"
                              >
                                <RefreshIcon />
                              </IconButton>
                            </InputAdornment>
                          }
                        >
                          <option aria-label="None" value="" />
                          {serialPortList.map(portItem => (
                            <option key={portItem.value} value={portItem.value}>
                              {portItem.text}
                            </option>
                          ))}
                        </SelectInput>
                      </Grid>

                      <Grid item md={12} xs={12}>
                        <TextInput
                          name="baudRate"
                          label="Taxa de comunicação"
                          variant="outlined"
                          onBlur={handleSyncStoreOnValueChange}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Divider />

                  <Grid item md={12} xs={12}>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      {serialPort ? (
                        <Button
                          type="button"
                          color="secondary"
                          variant="contained"
                          onClick={() => handleCLoseSerialConnection()}
                        >
                          Finalizar Conexão
                        </Button>
                      ) : (
                        <>
                          {!loading ? (
                            <Button
                              type="button"
                              color="primary"
                              variant="contained"
                              onClick={() => formRef.current?.submitForm()}
                            >
                              Iniciar Conexão
                            </Button>
                          ) : (
                            <CircularProgress />
                          )}
                        </>
                      )}
                    </Box>
                  </Grid>
                </Card>
              </Form>
            ) : (
              <CircularProgress />
            )}

            <Divider />

            <Form
              ref={formLogsRef}
              onSubmit={() => true}
              autoComplete="off"
              noValidate
            >
              <Card>
                <CardHeader title="Dados Recebidos" />
                <Divider />
                <CardContent>
                  <Grid item md={12} xs={12}>
                    <TextInput
                      id="receivedData"
                      name="receivedData"
                      label="Dados Recebidos"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={10}
                    />
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Logs" />
                <Divider />
                <CardContent>
                  <Grid item md={12} xs={12}>
                    <TextInput
                      id="logs"
                      name="logs"
                      label="Logs"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={10}
                    />
                  </Grid>
                </CardContent>
              </Card>
            </Form>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};

export default Dashboard;
