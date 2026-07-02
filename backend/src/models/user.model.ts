export interface User {
  id: string;
  username: string;
  password: string;
  role: 'manager' | 'operator';
}

export const users: User[] = [
  {
    id: '1',
    username: 'topburguer',
    password: 'topburguer',
    role: 'manager'
  },
  {
    id: '2',
    username: 'operador',
    password: 'operador123',
    role: 'operator'
  }
];
