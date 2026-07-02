import type { User } from '../../types/user';

export type AuthContextType = {
  user: User;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
};
