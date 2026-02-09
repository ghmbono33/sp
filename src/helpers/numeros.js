export const numDecimales = (num) => {
  // con +num pasamos num de string a número
  if (Number.isInteger(+num)) {
    return 0;
  } else {
    return num.toString().split('.')[1].length;
  }
};

export const formatearNumero = (numero) => {
  //  ejemplo: formatearNumero(1234.56) --> 1.234,56
  const separadorDecimal = ',';
  const separadorMiles = '.';

  const partes = numero.toFixed(2).split('.');
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, separadorMiles);

  return partes.join(separadorDecimal);
};
