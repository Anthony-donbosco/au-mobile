import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../components/auth/Login';
import Registro from '../components/auth/Registro';

export type AuthStackParamList = {
  Login: undefined;
  Registro: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  onAuthChange: (isAuth: boolean) => void;
  onRoleChange: (role: number | null) => void;
}

const AuthNavigator: React.FC<AuthNavigatorProps> = ({
  onAuthChange,
  onRoleChange,
}) => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login">
        {(props) => (
          <Login 
            {...props} 
            onAuthChange={onAuthChange}
            onRoleChange={onRoleChange}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Registro">
        {(props) => (
          <Registro 
            {...props} 
            onAuthChange={onAuthChange}
            onRoleChange={onRoleChange}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthNavigator;