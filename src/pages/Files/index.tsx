import React, { useState, useRef, useCallback } from 'react';
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
} from '@material-ui/core';
import { FiFolder as FolderIcon } from 'react-icons/fi';
// import { Input as InputIcon } from '@material-ui/icons';

import Yup from '../../utils/validators/Yup';
import { useAuth } from '../../hooks/auth';
import { showOpenDialogFile } from '../../hooks/dialog';
import { getValidationErrors, getApiErrors } from '../../utils/getErrors';
import { Page, ButtonInput } from '../../components';
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

const Files: React.FC = () => {
  const { addToast } = useToast();
  // const navigate = useNavigate();
  const classes = useStyles();
  const [loading, setLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);
  const { isAuthenticated } = useAuth();

  const handleSubmit = useCallback(
    async (data: FormData) => {
      try {
        setLoading(true);
        formRef.current?.setErrors({});

        console.log(data);
        return;

        const schemaForm = Yup.object().shape({
          apiUrl: Yup.string().url().required('Campo obrigatório'),
          apiLoginRoute: Yup.string().required('Campo obrigatório'),
          apiUsername: Yup.string().required('Campo obrigatório'),
          apiPassword: Yup.string().required('Campo obrigatório'),
          outputPath: Yup.string().required('Campo obrigatório'),
        });

        await schemaForm.validate(data, { abortEarly: false });

        // const { apiUrl, apiLoginRoute, apiUsername, apiPassword } = data;

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
    [addToast],
  );

  async function handlePickFile(inputRef: HTMLInputElement) {
    const dialogResponse = await showOpenDialogFile(inputRef.value);

    if (dialogResponse) {
      formRef.current.setFieldValue(inputRef.name, dialogResponse);
    }
  }

  const initialFormData = {};

  return (
    <Page className={classes.root}>
      <Container maxWidth="lg">
        <Grid container spacing={1}>
          <Grid item lg={12} md={12} xs={12}>
            <Card>
              <CardHeader title="Arquivos" subheader="Enviar" />

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
                    <Grid item md={12} xs={12}>
                      <ButtonInput
                        name="processFile"
                        label="Arquivo para processar"
                        variant="outlined"
                        fullWidth
                        adornment={
                          <InputAdornment position="start">
                            <IconButton
                              onClick={async () =>
                                handlePickFile(
                                  formRef.current.getFieldRef('processFile'),
                                )
                              }
                              color="inherit"
                            >
                              <FolderIcon />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </Grid>

                    <Divider />

                    <Grid item md={12} xs={12}>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        {!loading ? (
                          <Button
                            type="button"
                            color="primary"
                            variant="contained"
                          >
                            Listar Exames
                          </Button>
                        ) : (
                          <CircularProgress />
                        )}
                      </Box>
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

export default Files;
