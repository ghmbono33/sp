<template>
  <div>
    Datos Pedido: {{ st.dt.tipoImputacion }} - {{ st.dt.elementoImputacion }} - {{ st.dt.textoElementoImputacion }}
  </div>
  <div class="componente-inline">
    <a-form-item name="tipoSolicitud" label="Tipo Solicitud">
      <a-select
        v-model:value="st.dt.tipoSolicitud"
        :options="opcTipo"
        placeholder="Selecciona opción"
        style="width: 230px"
      >
      </a-select>
    </a-form-item>
    <!-- Importe, campo numérico con decimales -->
    <a-form-item name="importe" label="Importe">
      <a-input-number
        v-model:value="st.dt.importe"
        :min="0"
        :precision="2"
        :step="0.01"
        style="width: 120px"
        @pressEnter.prevent
      />
    </a-form-item>

    <a-form-item name="imputacion" label="Imputación">
      <a-select
        v-model:value="st.dt.prioridad"
        :options="opcImputacionComputed"
        placeholder="Selec. opción"
        style="width: 200px"
      >
      </a-select>
    </a-form-item>

    <!-- Nº Pedido -->
    <a-form-item name="numpedido" label="Nº Pedido">
      <a-input v-model:value="st.dt.numPedido" style="width: 120px" @blur="getPedido" @pressEnter.prevent />
    </a-form-item>
    <Loader :loading="loading" />
    <a-form-item label="F. Solicitud" class="ms-3">
      <a-input type="date" disabled style="width: 120px" v-model:value="st.dt.fecSolicitud" />
    </a-form-item>
  </div>
</template>

<!-- ------------------------------------------------------------------- -->
<script setup>
// import { message } from 'ant-design-vue';
import { httpJSONP } from '../helpers/http';
import { ref } from 'vue';
import { computed } from 'vue';

// Pinia
import { useStore } from '../stores/store.js';
const st = useStore();

// import { fechaVacia } from '../helpers/fechas.js';

const opcTipo = [
  { label: 'Pago de Factura', value: '1' },
  { label: 'Pago anticipado a proveedores', value: '2' },
  { label: 'Aportación UTES', value: '3' },
  { label: 'Otros', value: '4' },
];

const dataProv = ref(''); // para probar el v-model en el input de tipo texto
const loading = ref(false);

const opcImputacionBase = [
  { label: 'Pedido', value: 'P' },
  { label: 'Elem. Imputación', value: 'I' },
];

const opcImputacionComputed = computed(() =>
  // Inhabilitar la opción "Elem. Imputación" si el importe es mayor o igual a 3000
  opcImputacionBase.map((op) => ({
    ...op,
    disabled: op.value === 'I' && st.dt.importe >= 3000,
  })),
);

const getPedido = async () => {
  try {
    loading.value = true;
    const url = 'Busquedas_JSONP.asp';
    if (st.dt.numPedido.trim() === '') return;
    const payload = { numpedido: st.dt.numPedido };
    dataProv.value = await httpJSONP(url, payload);
    debugger;
    st.dt.codProv = dataProv.value.proveedor;
    st.dt.nomProv = dataProv.value.nomProveedor;
    st.dt.nifProv = dataProv.value.cifProveedor;
    st.dt.tipoImputacion = dataProv.value.tipoImputacion;
    st.dt.textoElementoImputacion = dataProv.value.textoElementoImputacion;
    st.dt.elementoImputacion = dataProv.value.elementoImputacion;
    st.dt.sociedad = dataProv.value.sociedad + ' - ' + dataProv.value.nomSociedad;
  } catch (error) {
    return console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>
<!-- ............................................... -->
<style>
/*  */
</style>
