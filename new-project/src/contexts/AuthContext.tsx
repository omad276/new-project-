import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api, TokenStorage } from '@/lib/api';
import type { User, UserRole, LoginResponse, RegisterResponse, RolePermissions, ROLE_PERMISSIONS as RolePermsType } from '@/types';
import { ROLE_PERMISSIONS } from '@/types';

// Auth context state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Register data
interface RegisterData {
  fullName: string;
  fullNameAr?: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

// Auth result
interface AuthResult {
  success: boolean;
  error?: string;
  errorAr?: string;
}

// Auth context value
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  isRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load user on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = TokenStorage.getAccessToken();
      if (!accessToken) {
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        const response = await api.get<User>('/auth/me');
        if (response.success && response.data) {
          setState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          TokenStorage.clearTokens();
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch {
        TokenStorage.clearTokens();
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const response = await api.post<LoginResponse>('/auth/login', {
          email,
          password,
        });

        if (response.success && response.data) {
          const { user, tokens } = response.data;
          TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        }

        return {
          success: false,
          error: response.message,
          errorAr: response.messageAr,
        };
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          error: 'An error occurred during login',
          errorAr: 'حدث خطأ أثناء تسجيل الدخول',
        };
      }
    },
    []
  );

  // Register
  const register = useCallback(
    async (data: RegisterData): Promise<AuthResult> => {
      try {
        const response = await api.post<RegisterResponse>('/auth/register', data);

        if (response.success && response.data) {
          const { user, tokens } = response.data;
          TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        }

        return {
          success: false,
          error: response.message,
          errorAr: response.messageAr,
        };
      } catch (error) {
        console.error('Register error:', error);
        return {
          success: false,
          error: 'An error occurred during registration',
          errorAr: 'حدث خطأ أثناء التسجيل',
        };
      }
    },
    []
  );

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = TokenStorage.getRefreshToken();
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
    TokenStorage.clearTokens();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Update profile
  const updateProfile = useCallback(
    async (updates: Partial<User>): Promise<AuthResult> => {
      try {
        const response = await api.patch<User>('/auth/me', updates);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            user: response.data!,
          }));
          return { success: true };
        }

        return {
          success: false,
          error: response.message,
          errorAr: response.messageAr,
        };
      } catch (error) {
        console.error('Update profile error:', error);
        return {
          success: false,
          error: 'An error occurred while updating profile',
          errorAr: 'حدث خطأ أثناء تحديث الملف الشخصي',
        };
      }
    },
    []
  );

  // Change password
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
      try {
        const response = await api.post('/auth/change-password', {
          currentPassword,
          newPassword,
        });

        if (response.success) {
          // Password changed, tokens invalidated - need to re-login
          TokenStorage.clearTokens();
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return { success: true };
        }

        return {
          success: false,
          error: response.message,
          errorAr: response.messageAr,
        };
      } catch (error) {
        console.error('Change password error:', error);
        return {
          success: false,
          error: 'An error occurred while changing password',
          errorAr: 'حدث خطأ أثناء تغيير كلمة المرور',
        };
      }
    },
    []
  );

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get<User>('/auth/me');
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          user: response.data!,
        }));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      if (!state.user) return false;
      const permissions = ROLE_PERMISSIONS[state.user.role];
      return permissions[permission];
    },
    [state.user]
  );

  // Check if user has one of the specified roles
  const isRole = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!state.user) return false;
      return roles.includes(state.user.role);
    },
    [state.user]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
        hasPermission,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
