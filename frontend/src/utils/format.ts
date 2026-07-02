export function formatCurrency(value: number) {
  const v = Number(value || 0);
  const fixed = v.toFixed(2); // garante duas casas
  const [intPart, decPart] = fixed.split('.');
  // formata milhares com ponto (BR)
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${intFormatted},${decPart}`;
}

export function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
