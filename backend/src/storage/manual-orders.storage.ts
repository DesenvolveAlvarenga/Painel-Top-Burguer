import fs from 'fs/promises';
import path from 'path';
import { Order } from '../models/order.model';

const storageDir = path.resolve(__dirname, '../../data');
const storageFile = path.join(storageDir, 'manual-orders.json');

interface ManualOrdersSchema {
  nextId: number;
  orders: Order[];
}

async function ensureStorageDir() {
  await fs.mkdir(storageDir, { recursive: true });
}

async function readStorage(): Promise<ManualOrdersSchema> {
  await ensureStorageDir();
  try {
    const raw = await fs.readFile(storageFile, 'utf-8');
    return JSON.parse(raw) as ManualOrdersSchema;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { nextId: -1, orders: [] };
    }
    throw error;
  }
}

async function writeStorage(data: ManualOrdersSchema) {
  await ensureStorageDir();
  await fs.writeFile(storageFile, JSON.stringify(data, null, 2), 'utf-8');
}

export class ManualOrderStorage {
  static async list(): Promise<Order[]> {
    const storage = await readStorage();
    return storage.orders;
  }

  static async get(orderId: number): Promise<Order | null> {
    const storage = await readStorage();
    return storage.orders.find((order) => order.id === orderId) || null;
  }

  static async create(order: Omit<Order, 'id'>): Promise<Order> {
    const storage = await readStorage();
    const newOrder: Order = {
      ...order,
      id: storage.nextId,
    };
    storage.nextId -= 1;
    storage.orders.unshift(newOrder);
    await writeStorage(storage);
    return newOrder;
  }

  static async update(orderId: number, updates: Partial<Order>): Promise<Order> {
    const storage = await readStorage();
    const index = storage.orders.findIndex((order) => order.id === orderId);
    if (index === -1) {
      throw new Error('Pedido manual não encontrado');
    }
    storage.orders[index] = {
      ...storage.orders[index],
      ...updates
    };
    await writeStorage(storage);
    return storage.orders[index];
  }
}
