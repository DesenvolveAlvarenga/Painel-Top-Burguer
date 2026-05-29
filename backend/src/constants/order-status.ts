export const ORDER_STATUS = {
  NEW: 'novo',
  PREPARO: 'em_preparo',
  SAIU: 'saiu_entrega',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado'
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  novo: 'Novo pedido',
  em_preparo: 'Em preparo',
  saiu_entrega: 'Saiu para entrega',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado'
};

export const STATUS_ORDER = ['novo', 'em_preparo', 'saiu_entrega', 'finalizado', 'cancelado'];
