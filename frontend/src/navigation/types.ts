import type { NavigatorScreenParams } from '@react-navigation/native';

export type UserTabParamList = {
  Configuracion: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserTabs: NavigatorScreenParams<UserTabParamList>; // 👈 anidado
};


