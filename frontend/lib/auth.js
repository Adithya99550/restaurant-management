export const getAuth = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  if (!token || !userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return { token, user };
  } catch {
    return null;
  }
};

export const setAuth = (token, user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const redirectByRole = (role) => {
  const routes = {
    WAITER: '/waiter',
    KITCHEN: '/kitchen',
    CASHIER: '/cashier',
    ADMIN: '/admin/analytics',
  };
  return routes[role] || '/login';
};