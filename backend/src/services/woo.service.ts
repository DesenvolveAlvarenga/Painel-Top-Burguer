import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { retry } from '../utils/retry.util';
import { WooAddress, WooOrder, WooOrdersResponse } from '../types/woocommerce';

const api: AxiosInstance = axios.create({
  baseURL: config.woo.url,
  auth: {
    username: config.woo.consumerKey,
    password: config.woo.consumerSecret
  },
  timeout: 15000
});

const findAddressNumber = (address: any) => {
  if (!address) return '';
  const candidates = ['number', 'street_number', 'house_number', 'numero', 'address_number', 'addr_number'];
  for (const key of candidates) {
    if (address[key]) {
      return String(address[key]).trim();
    }
  }
  return '';
};

const formatWooAddress = (address?: WooAddress) => {
  if (!address) return '';

  const address1 = address.address_1?.trim() || '';
  const address2 = address.address_2?.trim() || '';
  const country = (address as any).country?.trim() || '';
  const city = address.city?.trim() || '';
  const state = address.state?.trim() || '';
  const postcode = address.postcode?.trim() || '';
  const number = findAddressNumber(address);

  const parts = [] as string[];

  if (address1) {
    if (number && !/\d/.test(address1)) {
      parts.push(`${address1}, ${number}`);
    } else {
      parts.push(address1);
    }
  }

  if (address2) {
    const isNumber = /^[0-9]+[A-Za-zÀ-ÿ-\s]*$/.test(address2);
    if (isNumber && !number) {
      parts.push(`Nº ${address2}`);
    } else {
      parts.push(address2);
    }
  }

  if (!address1 && number) {
    parts.push(`Nº ${number}`);
  }

  if (city) parts.push(city);
  if (state) parts.push(state);
  if (postcode) parts.push(postcode);
  if (country) parts.push(country);

  return parts.filter(Boolean).join(', ');
};

const createOrder = (item: WooOrder) => {
  const billing = item.billing || {};
  const shipping = item.shipping || {};
  const shippingAddress = formatWooAddress(shipping);
  const billingAddress = formatWooAddress(billing);
  const customerName = billing.first_name && billing.last_name ? `${billing.first_name} ${billing.last_name}`.trim() : billing.first_name || 'Cliente';

  const deliveryStatus = String(
    item.meta_data?.find((meta) => meta.key === 'delivery_status')?.value || 'novo'
  );

  return {
    id: item.id,
    number: item.number || String(item.id),
    customerName,
    phone: billing.phone || '',
    address: shippingAddress || billingAddress || 'Endereço não informado',
    notes: item.customer_note || '',
    paymentMethod: item.payment_method_title || item.payment_method || 'Desconhecido',
    total: Number(item.total || 0),
    deliveryFee: Number(item.shipping_total || 0),
    coupon: item.coupon_lines?.map((coupon) => coupon.code).join(', ') || '',
    items: item.line_items?.map((product) => ({
      name: product.name,
      quantity: product.quantity,
      total: Number(product.total || 0)
    })) || [],
    status: deliveryStatus,
    wooStatus: item.status,
    date: item.date_created || '',
    metaData: item.meta_data || []
  };
};

export class WooService {
  static async fetchOrders() {
    const response = await retry(() => api.get<WooOrdersResponse>('/orders', {
      params: {
        per_page: 50,
        orderby: 'date',
        order: 'desc',
        status: 'pending,processing,on-hold,completed,cancelled'
      }
    }));

    return response.data.map(createOrder);
  }

  static async fetchOrderById(orderId: number) {
    const response = await retry(() => api.get<WooOrder>(`/orders/${orderId}`));
    return createOrder(response.data);
  }

  static async updateOrderStatus(orderId: number, status: string) {
    const payload: any = {
      meta_data: [
        {
          key: 'delivery_status',
          value: status
        }
      ]
    };

    switch (status) {
      case 'finalizado':
        payload.status = 'completed';
        break;
      case 'cancelado':
        payload.status = 'cancelled';
        break;
      case 'novo':
        payload.status = 'pending';
        break;
      case 'em_preparo':
      case 'saiu_entrega':
        payload.status = 'processing';
        break;
      default:
        payload.status = 'processing';
    }

    const response = await retry(() => api.put<WooOrder>(`/orders/${orderId}`, payload));
    return createOrder(response.data);
  }
}
