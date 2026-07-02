export interface OrderItem {
  name: string;
  quantity: number;
  total: number;
}

export interface Order {
  id: number;
  number: string;
  customerName: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: string;
  total: number;
  deliveryFee: number;
  coupon: string;
  items: OrderItem[];
  status: string;
  wooStatus: string;
  date: string;
  metaData?: any[];
  changeAmount?: number;
}
