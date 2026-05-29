import NodeCache from 'node-cache';
import { config } from '../config';
import { WooService } from './woo.service';
import { ManualOrderStorage } from '../storage/manual-orders.storage';
import { Order } from '../models/order.model';
import { formatPrintTicket } from '../utils/printer.util';

const cache = new NodeCache({ stdTTL: config.cacheTtlSeconds, checkperiod: 5 });

export class OrderService {
  static async list(params: { status: string; search: string; sort: string }): Promise<Order[]> {
    const cacheKey = 'orders-list';
    let orders: Order[] | undefined = cache.get(cacheKey);

    if (!orders) {
      const [wooOrders, manualOrders] = await Promise.all([
        WooService.fetchOrders(),
        ManualOrderStorage.list()
      ]);
      orders = [...manualOrders, ...wooOrders];
      cache.set(cacheKey, orders);
    }

    if (config.printAutomatic) {
      const knownIds = cache.get<number[]>('known-order-ids') || [];
      const freshOrders = orders.filter((order) => order.status === 'novo' && !knownIds.includes(order.id));
      freshOrders.forEach((order) => {
        console.log('Impressão automática de pedido recebido:', order.number);
        console.log(formatPrintTicket(order));
      });
      const allKnownIds = Array.from(new Set([...knownIds, ...freshOrders.map((order) => order.id)]));
      cache.set('known-order-ids', allKnownIds);
    }

    if (params.status) {
      orders = orders.filter((order) => order.status === params.status);
    }

    if (params.search) {
      const query = params.search.toLowerCase();
      orders = orders.filter((order) =>
        order.number.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.phone.toLowerCase().includes(query)
      );
    }

    if (params.sort === 'asc') {
      orders = orders.slice().sort((a, b) => a.date.localeCompare(b.date));
    }

    return orders;
  }

  static async get(orderId: number): Promise<Order> {
    const cacheKey = `order-${orderId}`;
    let order = cache.get<Order>(cacheKey);
    if (!order) {
      const manualOrder = await ManualOrderStorage.get(orderId);
      if (manualOrder) {
        order = manualOrder;
      } else {
        order = await WooService.fetchOrderById(orderId);
      }
      cache.set(cacheKey, order);
    }
    return order;
  }

  static async createManualOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
    const order = await ManualOrderStorage.create(orderData);
    cache.del('orders-list');
    cache.del(`order-${order.id}`);
    return order;
  }

  static async updateStatus(orderId: number, status: string): Promise<Order> {
    const manualOrder = await ManualOrderStorage.get(orderId);
    let order: Order;

    if (manualOrder) {
      order = await ManualOrderStorage.update(orderId, {
        status,
        wooStatus: 'manual'
      });
    } else {
      order = await WooService.updateOrderStatus(orderId, status);
    }

    cache.del('orders-list');
    cache.del(`order-${orderId}`);
    return order;
  }

  static async printOrder(orderId: number) {
    const order = await OrderService.get(orderId);
    return formatPrintTicket(order);
  }
}
