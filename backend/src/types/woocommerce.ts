export interface WooAddress {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface WooLineItem {
  name: string;
  quantity: number;
  total: string;
}

export interface WooCouponLine {
  code: string;
}

export interface WooMetaData {
  id?: number;
  key: string;
  value: any;
}

export interface WooOrder {
  id: number;
  number?: string;
  status: string;
  date_created: string;
  billing?: WooAddress & { phone?: string };
  shipping?: WooAddress;
  customer_note?: string;
  payment_method_title?: string;
  payment_method?: string;
  total?: string;
  shipping_total?: string;
  coupon_lines?: WooCouponLine[];
  line_items?: WooLineItem[];
  meta_data?: WooMetaData[];
}

type WooOrdersResponse = WooOrder[];

export { WooOrdersResponse };
