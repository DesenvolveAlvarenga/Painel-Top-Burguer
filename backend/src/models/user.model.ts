export interface User {
  id: string;
  username: string;
  password: string;
  role: 'manager' | 'operator';
}

export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'manager'
  },
  {
    id: '2',
    username: 'operador',
    password: 'operador123',
    role: 'operator'
  }
];
