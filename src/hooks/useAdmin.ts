import { useAuth } from './useAuth';

export const ADMIN_EMAIL = 'yogeshsoni7096@gmail.com';

export function useAdmin() {
  const { user, loading } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  
  return { isAdmin, loading };
}
