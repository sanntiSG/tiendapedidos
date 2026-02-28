const { calculateLineSubtotal, calculateOrderTotal } = require('../src/utils/priceCalculator');

describe('calculateLineSubtotal', () => {
  test('sin opciones', () => {
    expect(calculateLineSubtotal(500, [], 1)).toBe(500);
  });

  test('con opciones y cantidad 1', () => {
    const opts = [
      { unitPrice: 100, quantity: 2 },
      { unitPrice: 50, quantity: 1 },
    ];
    expect(calculateLineSubtotal(500, opts, 1)).toBe(750);
  });

  test('con opciones y cantidad mayor a 1', () => {
    const opts = [{ unitPrice: 100, quantity: 1 }];
    expect(calculateLineSubtotal(500, opts, 3)).toBe(1800);
  });

  test('precio base cero con opciones', () => {
    const opts = [{ unitPrice: 200, quantity: 2 }];
    expect(calculateLineSubtotal(0, opts, 1)).toBe(400);
  });
});

describe('calculateOrderTotal', () => {
  test('sin costo de delivery', () => {
    const lines = [{ lineSubtotal: 750 }, { lineSubtotal: 500 }];
    const result = calculateOrderTotal(lines, 0);
    expect(result.subtotal).toBe(1250);
    expect(result.total).toBe(1250);
  });

  test('con costo de delivery', () => {
    const lines = [{ lineSubtotal: 1000 }];
    const result = calculateOrderTotal(lines, 350);
    expect(result.subtotal).toBe(1000);
    expect(result.total).toBe(1350);
  });

  test('carrito vacio', () => {
    const result = calculateOrderTotal([], 0);
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(0);
  });
});
