import React, { createContext, useCallback, useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
import store from 'electron-settings';
import { URL } from 'url';

import api from '../services/api';

interface SignInCredencials {
  apiLoginUrl: string;
  apiUsername: string;
  apiPassword: string;
}

interface AuthContextData {
  isAuthenticated: boolean;
  signIn(credencials: SignInCredencials): Promise<void>;
  signOut(): void;
}

interface AuthState {
  token: string;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  // const navigate = useNavigate();

  const [data, setData] = useState<AuthState>(() => {
    const token = String(store.getSync('@SerialNode:token'));

    const isAuthenticated = store.hasSync('@SerialNode:isAuthenticated')
      ? Boolean(store.getSync('@SerialNode:isAuthenticated'))
      : false;

    const apiBaseUrl = String(store.getSync('apiUrl'));

    if (token) {
      api.defaults.headers.authorization = `Bearer ${token}`;
      api.defaults.baseURL = apiBaseUrl;
      return { token, isAuthenticated };
    }

    return {} as AuthState;
  });

  const signIn = useCallback(
    async ({ apiLoginUrl, apiUsername, apiPassword }) => {
      const response = await api.post(apiLoginUrl, {
        username: apiUsername,
        password: apiPassword,
      });

      const { token } = response.data;
      // const token = 'token-jwt';
      // const user = { id: 1, name: 'Diego' };
      const isAuthenticated = !!token;

      store.setSync('@SerialNode:token', token);
      store.setSync('@SerialNode:isAuthenticated', isAuthenticated);

      api.defaults.headers.authorization = `Bearer ${token}`;

      const apiBaseUrl = new URL(apiLoginUrl);
      api.defaults.baseURL = `${apiBaseUrl.protocol}//${apiBaseUrl.host}`;

      setData({ token, isAuthenticated });
    },
    [],
  );

  const signOut = useCallback(() => {
    store.unsetSync('@SerialNode:token');
    store.unsetSync('@SerialNode:isAuthenticated');

    api.defaults.headers.authorization = '';
    // navigate('/');

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: data.isAuthenticated, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

export { AuthProvider, useAuth };
