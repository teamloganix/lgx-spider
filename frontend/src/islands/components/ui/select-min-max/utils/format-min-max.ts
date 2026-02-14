export function formatThousands(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseToInteger(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, '');
  if (digits === '') return undefined;
  const num = parseInt(digits, 10);
  return Number.isNaN(num) || num < 0 ? undefined : num;
}
