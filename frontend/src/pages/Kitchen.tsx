import { useMemo, useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { Order } from '../types/order';
import { formatCurrency, formatDate } from '../utils/format';
import api from '../api/axios';

interface KitchenProps {
  onBack: () => void;
}

export default function Kitchen({ onBack }: KitchenProps) {
  const { orders, refresh, loading } = useOrders();
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const kitchenOrders = useMemo(
    () => orders.filter((order) => order.status === 'novo' || order.status === 'em_preparo'),
    [orders]
  );

  const handleStatus = async (order: Order, status: string) => {
    setStatusUpdateLoading(true);
    try {
      await api.post(`/orders/${order.id}/status`, { status });
      await refresh();
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const toggleSelected = (orderId: number) => {
    setSelectedOrderId((current) => (current === orderId ? null : orderId));
  };

  return (
    <div className='dashboard-page'>
      <header>
        <h1>Tela de Cozinha</h1>
        <p>Pedidos prontos para cozinha e em preparo, com leitura rápida para a linha de produção.</p>
      </header>

      <div className='container'>
        <div className='card kitchen-header'>
          <div>
            <h2>Fluxo da cozinha</h2>
            <p>Mostrando apenas pedidos novos e em preparo para facilitar o atendimento na cozinha.</p>
          </div>
          <div className='kitchen-actions'>
            <button className='btn' onClick={refresh} disabled={loading}>Atualizar</button>
            <button className='btn' onClick={onBack}>Voltar</button>
          </div>
        </div>

        <div className='kitchen-grid'>
          {loading ? (
            <div className='loader'>Carregando pedidos...</div>
          ) : kitchenOrders.length === 0 ? (
            <div className='empty'>Nenhum pedido para cozinha no momento.</div>
          ) : (
            kitchenOrders.map((order) => {
              const isSelected = selectedOrderId === order.id;
              return (
                <article
                  key={order.id}
                  className={`kitchen-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSelected(order.id)}
                >
                  <div className='kitchen-card-head'>
                    <div>
                      <strong>Pedido #{order.number}</strong>
                      <p>{formatDate(order.date)}</p>
                    </div>
                    <span className={`status-pill status-${order.status}`}>{order.status.replace('_', ' ')}</span>
                  </div>
                  <div className='kitchen-card-row'>
                    <span>Cliente</span>
                    <strong>{order.customerName}</strong>
                  </div>
                  <div className='kitchen-card-row'>
                    <span>Telefone</span>
                    <strong>{order.phone || '---'}</strong>
                  </div>
                  <div className='kitchen-card-row kitchen-items'>
                    <span>Itens</span>
                    <div>
                      {order.items.map((item, index) => (
                        <div key={`${order.id}-${item.name}-${index}`} className='kitchen-item'>
                          <span>{item.quantity}x {item.name}</span>
                          <strong>{formatCurrency(item.total)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  {order.notes ? (
                    <div className='kitchen-card-row'>
                      <span>Obs.</span>
                      <strong>{order.notes}</strong>
                    </div>
                  ) : null}

                  <div className='kitchen-card-row'>
                    <span>Total</span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                  <div className='kitchen-card-actions'>
                    {order.status === 'novo' ? (
                      <button
                        className='btn btn-secondary'
                        onClick={(event) => {
                          event.stopPropagation();
                          handleStatus(order, 'em_preparo');
                        }}
                        disabled={statusUpdateLoading}
                      >
                        Iniciar preparo
                      </button>
                    ) : (
                      <button
                        className='btn btn-secondary'
                        onClick={(event) => {
                          event.stopPropagation();
                          handleStatus(order, 'saiu_entrega');
                        }}
                        disabled={statusUpdateLoading}
                      >
                        Saiu para entrega
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
