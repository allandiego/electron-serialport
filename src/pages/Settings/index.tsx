import React, { FocusEvent, useState, useRef, useCallback } from 'react';
import store from 'electron-settings';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
// import { useNavigate } from 'react-router-dom';
import {
  Box,
  makeStyles,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  InputAdornment,
  Divider,
  CircularProgress,
  Button,
  Typography,
  Chip,
} from '@material-ui/core';
import { FiFolder as FolderIcon } from 'react-icons/fi';
// import { Input as InputIcon } from '@material-ui/icons';

import Yup from '../../utils/validators/Yup';
import { useAuth } from '../../hooks/auth';
import {
  showOpenDialogDirectory,
  showOpenDialogFile,
} from '../../hooks/dialog';
import { getValidationErrors, getApiErrors } from '../../utils/getErrors';
import { Page, ButtonInput, TextInput } from '../../components';
import { useToast } from '../../hooks/toast';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.default,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
}));

interface FormData {
  apiUrl: string;
  apiLoginRoute: string;
  apiSendRoute: string;
  apiUsername: string;
  apiPassword: string;
  outputFilePath: string;
}

const Settings: React.FC = () => {
  const { addToast } = useToast();
  // const navigate = useNavigate();
  const classes = useStyles();
  const [loading, setLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);
  const { isAuthenticated, signIn, signOut } = useAuth();

  const handleLogout = useCallback(() => {
    if (isAuthenticated) {
      signOut();

      addToast({
        type: 'info',
        title: 'Atenção',
        delay: 10000,
        description: 'Usuário desconectado',
      });
    }
  }, [isAuthenticated, signOut, addToast]);

  const handleSubmit = useCallback(
    async (data: FormData) => {
      try {
        setLoading(true);
        formRef.current?.setErrors({});

        const schemaForm = Yup.object().shape({
          apiUrl: Yup.string().url().required('Campo obrigatório'),
          apiLoginRoute: Yup.string().required('Campo obrigatório'),
          apiUsername: Yup.string().required('Campo obrigatório'),
          apiPassword: Yup.string().required('Campo obrigatório'),
        });

        await schemaForm.validate(data, { abortEarly: false });

        const { apiUrl, apiLoginRoute, apiUsername, apiPassword } = data;

        await signIn({
          apiLoginUrl: `${apiUrl}/${apiLoginRoute}`,
          apiUsername,
          apiPassword,
        });

        addToast({
          type: 'success',
          title: 'Sucesso!',
          description: 'Login realizado com sucesso!',
        });
      } catch (error) {
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
          title: 'Erro na autenticação',
          delay: 10000,
          description: `${getApiErrors(error)}`,
        });
      } finally {
        setLoading(false);
      }
    },
    [addToast, signIn],
  );

  async function updateConfigData(
    type: 'file' | 'directory',
    inputRef: HTMLInputElement,
  ) {
    const dialogResponse =
      type === 'file'
        ? await showOpenDialogFile(inputRef.value)
        : await showOpenDialogDirectory(inputRef.value);

    if (dialogResponse) {
      formRef.current.setFieldValue(inputRef.name, dialogResponse);
      // inputRef.value = dialogResponse;
      // inputRef.setAttribute('value', dialogResponse);

      // await ipcRenderer.invoke('setStoreValue', storeKey, dialogPath);
      store.setSync(inputRef.name, dialogResponse);
    }
  }

  function handleSyncStoreOnValueChange(event: FocusEvent<HTMLInputElement>) {
    const input = event.target as HTMLInputElement;
    if (input?.value && input?.name) {
      store.setSync(input.name, input.value);
    }
  }

  const initialFormData = {
    apiUrl: store.hasSync('apiUrl') ? store.getSync('apiUrl') : '',
    apiLoginRoute: store.hasSync('apiUrl')
      ? store.getSync('apiLoginRoute')
      : '',
    apiSendRoute: store.hasSync('apiSendRoute')
      ? store.getSync('apiSendRoute')
      : '',
    apiUsername: store.hasSync('apiUsername')
      ? store.getSync('apiUsername')
      : '',
    outputPath: store.hasSync('outputPath') ? store.getSync('outputPath') : '',
  };

  return (
    <Page className={classes.root}>
      <Container maxWidth="lg">
        <Grid container spacing={1}>
          <Grid item lg={12} md={12} xs={12}>
            <Card>
              <CardHeader title="Configurações" subheader="Serial" />

              <Divider />
              <Form
                ref={formRef}
                initialData={initialFormData}
                onSubmit={handleSubmit}
                autoComplete="off"
                noValidate
                className={classes.root}
              >
                <CardContent>
                  <Grid container spacing={1}>
                    {isAuthenticated ? (
                      <>
                        <Grid item md={12} xs={12}>
                          <Typography variant="h6" gutterBottom>
                            Autenticado como:
                          </Typography>

                          <Chip
                            label={store.getSync('apiUsername')}
                            color="primary"
                          />
                        </Grid>

                        <Grid item md={12} xs={12}>
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              type="button"
                              color="secondary"
                              variant="contained"
                              onClick={handleLogout}
                            >
                              Sair
                            </Button>
                          </Box>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item md={12} xs={12}>
                          <TextInput
                            name="apiUrl"
                            label="Url da API"
                            variant="outlined"
                            disabled={isAuthenticated}
                            onBlur={handleSyncStoreOnValueChange}
                            fullWidth
                          />

                          <TextInput
                            name="apiLoginRoute"
                            label="Rota de Login"
                            variant="outlined"
                            disabled={isAuthenticated}
                            onBlur={handleSyncStoreOnValueChange}
                            fullWidth
                          />

                          <TextInput
                            name="apiSendRoute"
                            label="Rota de Envio"
                            variant="outlined"
                            disabled={isAuthenticated}
                            onBlur={handleSyncStoreOnValueChange}
                            fullWidth
                          />
                        </Grid>

                        <Grid item md={12} xs={12}>
                          <TextInput
                            name="apiUsername"
                            label="Usuário"
                            variant="outlined"
                            disabled={isAuthenticated}
                            onBlur={handleSyncStoreOnValueChange}
                            fullWidth
                          />
                        </Grid>

                        <Grid item md={12} xs={12}>
                          <TextInput
                            name="apiPassword"
                            label="Senha"
                            variant="outlined"
                            type="password"
                            hidden={isAuthenticated}
                            fullWidth
                          />
                        </Grid>

                        <Divider />

                        <Grid item md={12} xs={12}>
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            {!loading ? (
                              <Button
                                type="submit"
                                color="primary"
                                variant="contained"
                              >
                                Login
                              </Button>
                            ) : (
                              <CircularProgress />
                            )}
                          </Box>
                        </Grid>
                      </>
                    )}

                    <Grid item md={12} xs={12}>
                      <ButtonInput
                        name="outputPath"
                        label="Caminho para Saída do Arquivo"
                        variant="outlined"
                        fullWidth
                        adornment={
                          <InputAdornment position="start">
                            <IconButton
                              onClick={async () => {
                                updateConfigData(
                                  'directory',
                                  formRef.current.getFieldRef('outputPath'),
                                );
                              }}
                              color="inherit"
                            >
                              <FolderIcon />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Form>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};

export default Settings;
