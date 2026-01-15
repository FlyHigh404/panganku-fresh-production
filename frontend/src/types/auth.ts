export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}