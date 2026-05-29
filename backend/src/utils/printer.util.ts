import { Order } from '../models/order.model';

export function formatPrintTicket(order: Order) {
  const lines = [];
  lines.push('--------------------------------');
  lines.push('PIZZARIA XYZ');
  lines.push(`Pedido #${order.number}`);
  lines.push(new Date(order.date).toLocaleString('pt-BR'));
  lines.push('--------------------------------');
  lines.push('Cliente:');
  lines.push(order.customerName);
  lines.push('');
  lines.push('Telefone:');
  lines.push(order.phone);
  lines.push('');
  lines.push('Entrega:');
  lines.push(order.address);
  lines.push('');
  lines.push('Itens:');
  order.items.forEach((item) => {
    lines.push(`${item.quantity}x ${item.name}`);
  });
  if (order.notes) {
    lines.push('');
    lines.push('Observações:');
    lines.push(order.notes);
  }
  lines.push('');
  lines.push('Pagamento:');
  lines.push(order.paymentMethod);
  if (order.coupon) {
    lines.push('');
    lines.push('Cupom:');
    lines.push(order.coupon);
  }
  lines.push('');
  lines.push(`Total: R$ ${order.total.toFixed(2)}`);
  lines.push('');
  lines.push('Obrigado pela preferência');
  lines.push('');
  lines.push('--------------------------------');
  lines.push('[Corte aqui]');
  return lines.join('\n');
}
