export const fmtMAD = (n: number, withUnit = false) => {
  const value = new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return withUnit ? `${value} MAD` : value;
};

export const fmtInt = (n: number) => new Intl.NumberFormat("fr-MA").format(n);

export const mkRef = () => Math.random().toString(16).slice(2, 10);