/**
 * Calculates the subtotal for a single order line.
 * lineSubtotal = (basePrice + sum of all option subtotals) * quantity
 */
function calculateLineSubtotal(basePrice, selectedOptions, quantity) {
  const optionsTotal = selectedOptions.reduce((acc, opt) => {
    return acc + opt.unitPrice * opt.quantity;
  }, 0);
  return (basePrice + optionsTotal) * quantity;
}

/**
 * Calculates the full order total from lines and delivery cost.
 */
function calculateOrderTotal(lines, deliveryCost) {
  const subtotal = lines.reduce((acc, line) => acc + line.lineSubtotal, 0);
  return { subtotal, total: subtotal + deliveryCost };
}

module.exports = { calculateLineSubtotal, calculateOrderTotal };
