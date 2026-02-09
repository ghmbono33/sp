export const esDesarrollo = () => {
  //Devuelve si estamos en desarrollo (en mi equipo local) o en productivo (intranet)
  const path = window.location.href.toLowerCase();
  return !path.includes('web.lubasa.net');
};
export const esLocal = () => {
  //Devuelve si estamos en mi equipo local
  const path = window.location.href.toLowerCase();
  return path.includes('localhost') || path.includes('127.0.0.1');
};

export const esperarSegundos = async (segundos) => {
  // para la ejecución n segundos, debe llamarse con await
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`espera de ${segundos} segundos`);
      resolve(true);
    }, segundos * 1000);
  });
};

export const urlParam = (param) => {
  // Devuelve el valor del parametro param existente en la url
  // Hay que pasar el parámetro en minúsculas
  const params = new URLSearchParams(window.location.search.toLowerCase());
  return params.get(param) === null ? '' : params.get(param);
};
