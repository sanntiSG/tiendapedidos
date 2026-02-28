const DELIVERY_LABELS = {
  pickup: 'Retiro en local',
  delivery: 'Delivery',
};

const PAYMENT_LABELS = {
  cash: 'Efectivo',
  transfer: 'Transferencia bancaria',
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparacion',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

function formatARS(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
}

function buildWhatsappMessage(order, buyerName, buyerPhone) {
  const date = new Date(order.createdAt).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines = [];
  lines.push('--- NUEVO PEDIDO ---');
  lines.push(`Numero: ${order.orderNumber}`);
  lines.push(`Fecha: ${date}`);
  lines.push('');
  lines.push('-- DETALLE --');

  for (const line of order.lines) {
    const optionsTotal = (line.selectedOptions || []).reduce((acc, opt) => acc + (opt.unitPrice * opt.quantity), 0);
    const unitTotal = line.basePrice + optionsTotal;

    lines.push(`*${line.productName}* x${line.quantity}`);
    lines.push(`  Base: ${formatARS(line.basePrice)} c/u`);

    const activeOptions = (line.selectedOptions || []).filter(opt => opt.quantity > 0);
    for (const opt of activeOptions) {
      const priceText = opt.unitPrice > 0 ? `(+${formatARS(opt.unitPrice)})` : '(Gratis)';
      lines.push(`  └ _${opt.itemName}_ ${priceText}`);
    }

    lines.push(`  *Subtotal item:* ${formatARS(line.lineSubtotal)}`);
    lines.push('');
  }

  lines.push('-------------------');
  lines.push(`*PRODUCTOS:* ${formatARS(order.subtotal)}`);

  if (order.deliveryType === 'delivery') {
    lines.push(`*Envio:* ${formatARS(order.deliveryCost)}`);
  }

  lines.push(`*TOTAL A PAGAR: ${formatARS(order.total)}*`);
  lines.push('');
  lines.push('-- DATOS DEL PEDIDO --');
  lines.push(`Tipo: ${DELIVERY_LABELS[order.deliveryType]}`);
  lines.push(`Pago: ${PAYMENT_LABELS[order.paymentMethod]}`);

  if (order.deliveryType === 'delivery' && order.deliveryAddress) {
    lines.push(`Direccion: ${order.deliveryAddress}`);
  }

  if (order.notes) {
    lines.push(`Observaciones: ${order.notes}`);
  }

  lines.push('');
  lines.push('-- COMPRADOR --');
  lines.push(`Nombre: ${buyerName}`);
  lines.push(`Telefono: ${buyerPhone}`);
  lines.push('-------------------');

  return lines.join('\n');
}

function buildWhatsappUrl(vendorNumber, message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${vendorNumber}?text=${encoded}`;
}

module.exports = { buildWhatsappMessage, buildWhatsappUrl, formatARS, STATUS_LABELS };
