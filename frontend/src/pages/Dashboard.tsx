import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Order } from '../types/order';
import { formatCurrency, formatDate } from '../utils/format';
import api from '../api/axios';

const statuses = [
  { value: '', label: 'Todos' },
  { value: 'novo', label: 'Novo pedido' },
  { value: 'em_preparo', label: 'Em preparo' },
  { value: 'saiu_entrega', label: 'Saiu para entrega' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' }
];

interface DashboardProps {
  onOpenKitchen: () => void;
}

export default function Dashboard({ onOpenKitchen }: DashboardProps) {
  const { logout, username } = useAuth();
  const {
    orders,
    selectedOrder,
    setSelectedOrder,
    statusFilter,
    search,
    sort,
    pendingCount,
    loading,
    setStatusFilter,
    setSearch,
    setSort,
    refresh
  } = useOrders();
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [manualNumber, setManualNumber] = useState('');
  const [manualCustomer, setManualCustomer] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualPayment, setManualPayment] = useState('Cartão de crédito');
  const [manualShipping, setManualShipping] = useState('0.00');
  const [manualTotal, setManualTotal] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualItemsInput, setManualItemsInput] = useState('1;X-Burguer;25.00');
  const [manualOrder, setManualOrder] = useState<Order | null>(null);
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    if (!selectedOrder && orders.length) {
      setSelectedOrder(orders[0]);
    }
  }, [orders]);

  const selected = selectedOrder ?? orders[0] ?? null;

  const handleStatus = async (order: Order, status: string) => {
    setStatusUpdateLoading(true);
    try {
      await api.post(`/orders/${order.id}/status`, { status });
      await refresh();
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const openPrintWindow = (html: string) => {
    const printWindow = window.open('', '_blank', 'width=420,height=640');
    if (!printWindow) {
      window.alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  };

  const buildPrintHtml = (order: Order, title = 'Recibo 58mm') => {
    const itemsHtml = order.items
      .map(
        (item) =>
          `<div class="print-item"><span>${item.quantity}x ${item.name}</span><span>${formatCurrency(item.total)}</span></div>`
      )
      .join('');

    const notesHtml = order.notes
      ? `<div class="print-section"><strong>OBS:</strong><div class="print-notes">${order.notes}</div></div>`
      : '';

    return `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Courier New', Courier, monospace; color: #000; background: #fff; }
          .receipt { width: 58mm; padding: 8px 6px; font-size: 13px; line-height: 1.4; font-weight: 600; }
          .receipt h1 { font-size: 18px; margin: 0 0 6px; text-align: center; letter-spacing: 0.04em; font-weight: 700; }
          .receipt .center { text-align: center; }
          .receipt .section { margin-bottom: 8px; }
          .receipt .section strong { display: block; margin-bottom: 4px; font-size: 12px; font-weight: 700; }
          .receipt .section span { display: block; font-size: 12px; }
          .print-item { display: flex; justify-content: space-between; gap: 6px; margin-bottom: 4px; font-size: 12px; font-weight: 700; }
          .print-item span:last-child { min-width: 36px; text-align: right; }
          .print-divider { border-top: 1px dashed #000; margin: 8px 0; }
          .print-section { margin-top: 6px; }
          .print-section strong { font-size: 13px; font-weight: 800; }
          .print-notes { font-size: 14px; margin-top: 5px; white-space: pre-wrap; font-weight: 700; line-height: 1.45; }
          .footer { text-align: center; margin-top: 4px; font-size: 11px; font-weight: 700; }
          .total-row { display: flex; justify-content: space-between; gap: 6px; font-weight: 700; margin-top: 6px; font-size: 13px; }
          @page { size: 58mm auto; margin: 4mm; }
          @media print {
            body { margin: 0; }
            .receipt { padding: 4mm 6mm; width: 58mm; }
          }
        </style>
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </head>
      <body>
        <div class="receipt">
          <h1>TOP BURGUER DELIVERY</h1>
          <div class="section center">
            <span>${formatDate(order.date)}</span>
            <span>Pedido #${order.number}</span>
          </div>
          <div class="print-divider"></div>
          <div class="section">
            <strong>Cliente</strong>
            <span>${order.customerName}</span>
            <span>${order.phone || 'Sem telefone'}</span>
            <span>${order.address}</span>
          </div>
          <div class="print-divider"></div>
          <div class="section">
            <strong>Itens</strong>
            ${itemsHtml}
          </div>
          <div class="print-divider"></div>
          <div class="section">
            <div class="total-row"><span>Entrega</span><span>${formatCurrency(order.deliveryFee)}</span></div>
            <div class="total-row"><span>Total</span><span>${formatCurrency(order.total)}</span></div>
          </div>
          ${notesHtml}
          <div class="footer">Obrigado pela preferência!</div>
        </div>
      </body>
      </html>`;
  };

  const handlePrint = (order: Order) => {
    const html = buildPrintHtml(order);
    openPrintWindow(html);
  };

  const formatManualItems = () => {
    return manualItemsInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [quantity = '1', name = '', total = '0'] = line.split(';').map((value) => value.trim());
        return {
          name: name || 'Item',
          quantity: Number(quantity) || 1,
          total: Number(total.replace(',', '.')) || 0
        };
      });
  };

  const computeManualTotal = () => {
    const itemsTotal = formatManualItems().reduce((sum, item) => sum + item.total, 0);
    const shipping = Number(manualShipping.replace(',', '.')) || 0;
    if (manualTotal.trim()) {
      return Number(manualTotal.replace(',', '.')) || itemsTotal + shipping;
    }
    return itemsTotal + shipping;
  };

  const generateManualOrder = async () => {
    const items = formatManualItems();
    const total = computeManualTotal();
    const orderNumber = manualNumber.trim() || `M-${Date.now()}`;

    const payload = {
      number: orderNumber,
      customerName: manualCustomer.trim() || 'Cliente sem nome',
      phone: manualPhone.trim() || 'Não informado',
      address: manualAddress.trim() || 'Endereço não informado',
      notes: manualNotes.trim(),
      paymentMethod: manualPayment,
      total,
      deliveryFee: Number(manualShipping.replace(',', '.')) || 0,
      coupon: '',
      items,
      status: 'novo',
      wooStatus: 'manual',
      date: new Date().toISOString()
    };

    try {
      setManualLoading(true);
      const response = await api.post<Order>('/orders', payload);
      setManualOrder(response.data);
      await refresh();
    } catch (error) {
      console.error('Falha ao salvar pedido manual:', error);
      window.alert('Não foi possível salvar o pedido manual. Tente novamente.');
    } finally {
      setManualLoading(false);
    }
  };

  const printManualOrder = () => {
    if (!manualOrder) {
      window.alert('Gere o pedido manual antes de imprimir.');
      return;
    }

    const html = buildPrintHtml(manualOrder, 'Pedido manual');
    openPrintWindow(html);
  };

  const orderDetail = useMemo(() => selected, [selected]);

  return (
    <div className='dashboard-page'>
      <header>
        <h1>Painel de Pedidos - TOP BURGUER</h1>
        <p>Controle seus pedidos com estilo e rapidez no painel mais bonito e funcional da sua operação.</p>
      </header>

      <div className='container'>
        <div className='card top-card'>
          <div className='top-card-header'>
            <div>
              <h2>Visão geral</h2>
              <p>Pedidos em tempo real para sua operação delivery.</p>
            </div>
            <div className='top-card-actions'>
              <button className='btn' onClick={refresh}>Atualizar</button>
              <button className='btn btn-secondary' onClick={onOpenKitchen}>Tela Cozinha</button>
            </div>
          </div>

          <div className='top-card-grid'>
            <div className='small-card'>
              <strong>Pedidos pendentes</strong>
              <span>{pendingCount}</span>
            </div>
            <div className='filter-card'>
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className='filter-card'>
              <label>Buscar</label>
              <input
                placeholder='Pedido, cliente ou telefone'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className='filter-card'>
              <label>Ordenar</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value='desc'>Mais recentes</option>
                <option value='asc'>Mais antigos</option>
              </select>
            </div>
          </div>
        </div>

        <div className='manual-card card'>
          <div className='manual-card-header'>
            <div>
              <h2>Pedido manual</h2>
              <p>Crie um pedido rápido e imprima o recibo sem salvar no WooCommerce.</p>
            </div>
            <div className='manual-actions'>
              <button className='btn' onClick={generateManualOrder} disabled={manualLoading}>
                {manualLoading ? 'Salvando...' : 'Gerar pedido'}
              </button>
              <button className='btn' onClick={printManualOrder}>Imprimir recibo 58mm</button>
            </div>
          </div>
          <div className='manual-card-grid'>
            <div className='manual-form'>
              <div className='form-row'>
                <label>Número do pedido</label>
                <input value={manualNumber} onChange={(e) => setManualNumber(e.target.value)} placeholder='Ex: 1254' />
              </div>
              <div className='form-row'>
                <label>Cliente</label>
                <input value={manualCustomer} onChange={(e) => setManualCustomer(e.target.value)} placeholder='Nome do cliente' />
              </div>
              <div className='form-row'>
                <label>Telefone</label>
                <input value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} placeholder='(00) 00000-0000' />
              </div>
              <div className='form-row'>
                <label>Endereço de entrega</label>
                <input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder='Rua, número, bairro, complemento' />
              </div>
              <div className='form-row'>
                <label>Forma de pagamento</label>
                <select value={manualPayment} onChange={(e) => setManualPayment(e.target.value)}>
                  <option>Cartão de crédito</option>
                  <option>Dinheiro</option>
                  <option>Pix</option>
                </select>
              </div>
              <div className='form-row'>
                <label>Valor entrega (R$)</label>
                <input value={manualShipping} onChange={(e) => setManualShipping(e.target.value)} placeholder='0.00' />
              </div>
              <div className='form-row'>
                <label>Valor total (R$)</label>
                <input value={manualTotal} onChange={(e) => setManualTotal(e.target.value)} placeholder='Deixe em branco para cálculo automático' />
              </div>
              <div className='form-row'>
                <label>Itens (Qtd;Nome;Preço)</label>
                <textarea value={manualItemsInput} onChange={(e) => setManualItemsInput(e.target.value)} rows={5} />
              </div>
              <div className='form-row'>
                <label>Observações</label>
                <textarea value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} rows={3} />
              </div>
            </div>
            <div className='manual-preview'>
              <div className='preview-box'>
                <h3>Pré-visualização</h3>
                {manualOrder ? (
                  <>
                    <div className='preview-row'><span>Pedido</span><strong>{manualOrder.number}</strong></div>
                    <div className='preview-row'><span>Cliente</span><strong>{manualOrder.customerName}</strong></div>
                    <div className='preview-row'><span>Telefone</span><strong>{manualOrder.phone}</strong></div>
                    <div className='preview-row'><span>Endereço</span><strong>{manualOrder.address}</strong></div>
                    <div className='preview-row'><span>Pagamento</span><strong>{manualOrder.paymentMethod}</strong></div>
                    <div className='preview-line' />
                    <div className='preview-row preview-label'><span>Itens</span></div>
                    <div className='preview-items'>
                      {manualOrder.items.map((item) => (
                        <div key={item.name} className='preview-item'>
                          <span>{item.quantity}x {item.name}</span>
                          <span>{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                    <div className='preview-line' />
                    <div className='preview-row'><span>Entrega</span><strong>{formatCurrency(manualOrder.deliveryFee)}</strong></div>
                    <div className='preview-row'><span>Total</span><strong>{formatCurrency(manualOrder.total)}</strong></div>
                    <div className='preview-row'><span>Observações</span><strong>{manualOrder.notes || 'Sem observações'}</strong></div>
                  </>
                ) : (
                  <p>Digite os dados do pedido manual e clique em "Gerar pedido" para ver a pré-visualização.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='manual-preview-container'>
          <div className='card order-detail'>
            {orderDetail ? (
              <>
                <div className='detail-header'>
                  <div>
                    <h3>Pedido #{orderDetail.number}</h3>
                    <span>{formatDate(orderDetail.date)}</span>
                  </div>
                  <button className='btn' onClick={() => handlePrint(orderDetail)}>Imprimir</button>
                </div>

                <div className='detail-group'>
                  <strong>Cliente</strong>
                  <p>{orderDetail.customerName}</p>
                </div>
                <div className='detail-group'>
                  <strong>Telefone</strong>
                  <p>{orderDetail.phone}</p>
                </div>
                <div className='detail-group'>
                  <strong>Endereço</strong>
                  <p>{orderDetail.address}</p>
                </div>
                <div className='detail-group'>
                  <strong>Observações</strong>
                  <p>{orderDetail.notes || 'Sem observações'}</p>
                </div>
                <div className='detail-group'>
                  <strong>Pagamento</strong>
                  <p>{orderDetail.paymentMethod}</p>
                </div>
                <div className='detail-group'>
                  <strong>Delivery</strong>
                  <p>{formatCurrency(orderDetail.deliveryFee)}</p>
                </div>
                <div className='detail-group'>
                  <strong>Cupom</strong>
                  <p>{orderDetail.coupon || 'Nenhum'}</p>
                </div>

                <div className='detail-items'>
                  <strong>Produtos</strong>
                  <ul>
                    {orderDetail.items.map((product) => (
                      <li key={product.name}>
                        <span className='product-qty'>{product.quantity}x</span>
                        <span>{product.name}</span>
                        <span>{formatCurrency(product.total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='order-summary'>
                  <span>Total</span>
                  <strong>{formatCurrency(orderDetail.total)}</strong>
                </div>

                <div className='actions'>
                  <button className='btn' onClick={() => handleStatus(orderDetail, 'em_preparo')} disabled={statusUpdateLoading}>Iniciar preparo</button>
                  <button className='btn' onClick={() => handleStatus(orderDetail, 'saiu_entrega')} disabled={statusUpdateLoading}>Saiu para entrega</button>
                  <button className='btn' onClick={() => handleStatus(orderDetail, 'finalizado')} disabled={statusUpdateLoading}>Finalizar</button>
                  <button className='btn' onClick={() => handleStatus(orderDetail, 'cancelado')} disabled={statusUpdateLoading}>Cancelar</button>
                </div>
              </>
            ) : (
              <div className='empty-detail'>Selecione um pedido para visualizar detalhes.</div>
            )}
          </div>

          <div className='card order-list'>
            <h2>Pedidos delivery</h2>
            {loading ? (
              <div className='loader'>Carregando pedidos...</div>
            ) : orders.length === 0 ? (
              <div className='empty'>Nenhum pedido encontrado.</div>
            ) : (
              <div className='order-list-grid'>
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className={`order-card ${order.status === 'novo' ? 'new-order' : ''} ${selected?.id === order.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOrder(order)}>
                    <div className='order-title'>
                      <span>Pedido #{order.number}</span>
                      <strong>{order.customerName}</strong>
                    </div>
                    <div className='order-meta'>
                      <span>{order.phone}</span>
                      <span>{formatDate(order.date)}</span>
                    </div>
                    <div className='order-state'>
                      <span>{order.status.replace('_', ' ')}</span>
                      <strong>{formatCurrency(order.total)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
