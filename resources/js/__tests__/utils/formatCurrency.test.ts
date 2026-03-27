import { formatCurrency } from '@/lib/utils/formatCurrency';

describe('formatCurrency', () => {
  it('formats ZAR with R symbol', () => {
    const result = formatCurrency(1200);
    expect(result).toContain('R');
    expect(result).toContain('1');
    expect(result).toContain('200');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('R');
    expect(result).toContain('0');
  });

  it('handles large amounts', () => {
    const result = formatCurrency(1500000);
    expect(result).toContain('R');
    expect(result).toContain('500');
    expect(result).toContain('000');
  });

  it('handles decimal amounts', () => {
    const result = formatCurrency(99.99);
    expect(result).toContain('R');
    expect(result).toContain('99');
  });
});
