import $ from 'jquery';
export const httpJSONP = (url, data) => {
  const path = window.location.href.toLowerCase();
  // en función de desde donde se ejecute se llamará a webdes o a web
  url = `https://web${path.includes('web.lubasa.net') ? '' : 'des'}.lubasa.net/asp/sp/sp/asp/${url}`;
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      dataType: 'jsonp',
      data,
      success: function (response) {
        resolve(response);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
};
