import $ from 'jquery';
import { ref } from 'vue';

// Composable para peticiones HTTP utilizando AJAX JSONP de JQUERY
export const useAjax = () => {
  const data = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const ajax = async (url, payload) => {
    try {
      loading.value = true;
      data.value = await ajaxJSONP(url, payload);
      loading.value = false;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, error, ajax };
};

// Petición JSONP
const ajaxJSONP = (url, payload) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      dataType: 'jsonp',
      data: payload,
      success: function (response) {
        resolve(response);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
};
