// types.ts
export interface CredencialesLogin {
  email: string;
  contrasena: string;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  contrasena: string;
  confirmarContrasena: string;
  tipoUsuario?: 'usuario' | 'admin';
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  tipoUsuario: 'usuario' | 'admin';
}

export interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (usuario: Usuario) => void;
  logout: () => void;
}

// Interfaces para componentes de autenticación
export interface LoginProps {
  onSubmit: (credenciales: CredencialesLogin) => Promise<void>;
  loading: boolean;
  isDarkMode: boolean;
}

export interface RegistroProps {
  onSubmit: (datosRegistro: DatosRegistro) => Promise<void>;
  loading: boolean;
  isDarkMode: boolean;
}