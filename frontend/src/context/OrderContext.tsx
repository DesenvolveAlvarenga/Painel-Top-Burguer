// import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
// import api from '../api/axios';
// import { Order } from '../types/order';

// interface OrderContextProps {
//   orders: Order[];
//   selectedOrder: Order | null;
//   statusFilter: string;
//   search: string;
//   sort: string;
//   pendingCount: number;
//   loading: boolean;
//   setSelectedOrder: (order: Order | null) => void;
//   setStatusFilter: (status: string) => void;
//   setSearch: (value: string) => void;
//   setSort: (value: string) => void;
//   refresh: () => Promise<void>;
// }

// const OrderContext = createContext<OrderContextProps>({
//   orders: [],
//   selectedOrder: null,
//   statusFilter: '',
//   search: '',
//   sort: 'desc',
//   pendingCount: 0,
//   loading: false,
//   setSelectedOrder: () => {},
//   setStatusFilter: () => {},
//   setSearch: () => {},
//   setSort: () => {},
//   refresh: async () => {}
// });

// export function OrderProvider({ children }: { children: ReactNode }) {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [statusFilter, setStatusFilter] = useState('');
//   const [search, setSearch] = useState('');
//   const [sort, setSort] = useState('desc');
//   const [loading, setLoading] = useState(false);
//   const [previousNewOrderIds, setPreviousNewOrderIds] = useState<number[]>([]);

//   const pendingCount = useMemo(
//     () => orders.filter((order) => order.status === 'novo' || order.status === 'em_preparo' || order.status === 'saiu_entrega').length,
//     [orders]
//   );

//   const playNotification = () => {
//     try {
//       const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
//       const oscillator = audioCtx.createOscillator();
//       oscillator.type = 'sine';
//       oscillator.frequency.value = 520;
//       oscillator.connect(audioCtx.destination);
//       oscillator.start();
//       setTimeout(() => oscillator.stop(), 120);
//     } catch {
//       // ignore audio issues
//     }
//   };

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get<Order[]>('/orders', {
//         params: { status: statusFilter, search, sort }
//       });
//       setOrders(response.data);
//       const newIds = response.data.filter((order) => order.status === 'novo').map((order) => order.id);
//       if (previousNewOrderIds.length && newIds.some((id) => !previousNewOrderIds.includes(id))) {
//         playNotification();
//       }
//       setPreviousNewOrderIds(newIds);
//       if (!response.data.length) {
//         setSelectedOrder(null);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//     const interval = window.setInterval(fetchOrders, 7000);
//     return () => window.clearInterval(interval);
//   }, [statusFilter, search, sort]);

//   return (
//     <OrderContext.Provider
//       value={{
//         orders,
//         selectedOrder,
//         statusFilter,
//         search,
//         sort,
//         pendingCount,
//         loading,
//         setSelectedOrder,
//         setStatusFilter,
//         setSearch,
//         setSort,
//         refresh: fetchOrders
//       }}>
//       {children}
//     </OrderContext.Provider>
//   );
// }

// export function useOrders() {
//   return useContext(OrderContext);
// }





import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import api from '../api/axios';
import { Order } from '../types/order';
import { useAuth } from './AuthContext';

interface OrderContextProps {
  orders: Order[];
  selectedOrder: Order | null;
  statusFilter: string;
  search: string;
  sort: string;
  pendingCount: number;
  loading: boolean;
  setSelectedOrder: (order: Order | null) => void;
  setStatusFilter: (status: string) => void;
  setSearch: (value: string) => void;
  setSort: (value: string) => void;
  refresh: () => Promise<void>;
}

const OrderContext = createContext<OrderContextProps>({
  orders: [],
  selectedOrder: null,
  statusFilter: '',
  search: '',
  sort: 'desc',
  pendingCount: 0,
  loading: false,
  setSelectedOrder: () => {},
  setStatusFilter: () => {},
  setSearch: () => {},
  setSort: () => {},
  refresh: async () => {}
});

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [previousNewOrderIds, setPreviousNewOrderIds] = useState<number[]>([]);
  const { token } = useAuth();

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === 'novo' || order.status === 'em_preparo' || order.status === 'saiu_entrega').length,
    [orders]
  );

  const playNotification = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = 520;
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      setTimeout(() => oscillator.stop(), 120);
    } catch {
      // Ignora problemas de contexto de áudio
    }
  };

  const fetchOrders = async () => {
    if (!token) {
      return;
    }

    const params: Record<string, string> = { sort };
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;

    try {
      const response = await api.get<Order[]>('/orders', { params });
      setOrders(response.data);

      if (selectedOrder) {
        const updatedSelected = response.data.find((order) => order.id === selectedOrder.id) || null;
        setSelectedOrder(updatedSelected);
      }

      const newIds = response.data
        .filter((order) => order.status === 'novo')
        .map((order) => order.id);

      if (previousNewOrderIds.length > 0 && newIds.some((id) => !previousNewOrderIds.includes(id))) {
        playNotification();
      }

      setPreviousNewOrderIds(newIds);

      if (!response.data.length) {
        setSelectedOrder(null);
      }
    } catch (error: any) {
      console.error('Falha ao buscar pedidos:', error?.response?.status, error?.response?.data || error.message || error);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchOrders();
    const interval = window.setInterval(fetchOrders, 7000);

    return () => window.clearInterval(interval);
  }, [token, statusFilter, search, sort]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        selectedOrder,
        statusFilter,
        search,
        sort,
        pendingCount,
        loading,
        setSelectedOrder,
        setStatusFilter,
        setSearch,
        setSort,
        refresh: fetchOrders
      }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}