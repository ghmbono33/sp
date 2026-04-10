<template>
  <!-- Importe, campo numérico con decimales, debe ser mayor que 0 -->
  <div class="componente-inline">
    <a-form-item
      name="importe"
      label="Importe"
      :rules="[
        { required: true, message: 'Campo obligatorio' },
        { type: 'number', min: 1, message: 'El importe debe ser mayor que 0' },
      ]"
    >
      <a-input-number
        v-model:value="st.dt.importe"
        :min="0"
        :precision="2"
        :step="0.01"
        style="width: 110px"
        @pressEnter.prevent
        @blur="importeImputacion"
      />
    </a-form-item>

    <!-- Nº Pedido, no se muestra en solicitudes de tipo 3 Aportaciones UTES -->
    <a-form-item v-if="st.dt.tipoSolicitud !== '3'" name="numpedido" label="Nº Pedido">
      <a-input
        v-model:value="st.dt.numPedido"
        style="width: 110px"
        @focus="onFocusPedido"
        @blur="onBlurPedido"
        @pressEnter.prevent
      />
    </a-form-item>
    <Loader :loading="loading" />
    <!-- Empresas pagadora y destinataria (solo para solicitudes de tipo 3 Aportaciones UTES) -->
    <a-form-item
      label="Empresa pagadora"
      name="soc_pagadora"
      v-if="st.dt.tipoSolicitud === '3'"
      :rules="[{ required: true, message: 'Campo obligatorio' }]"
    >
      <a-select
        v-model:value="st.dt.soc_pagadora"
        show-search
        style="width: 250px; height: 35px"
        :options="st.gb.optSociedadesNoUTE"
        :filter-option="filterOption"
        :notFoundContent="''"
      ></a-select>
    </a-form-item>
    <a-form-item
      label="Empresa UTE destinaria"
      name="soc_destinataria"
      v-if="st.dt.tipoSolicitud === '3'"
      :rules="[{ required: true, message: 'Campo obligatorio' }]"
    >
      <a-select
        v-model:value="st.dt.soc_destinataria"
        show-search
        style="width: 250px; height: 35px"
        :options="st.gb.optSociedadesUTE"
        :filter-option="filterOption"
        :notFoundContent="''"
      ></a-select>
    </a-form-item>
    <a-form-item v-if="st.dt.inmovilizado && st.dt.tipoSolicitud !== '3'" name="inmovilizado" label="Inmovilizado">
      <a-checkbox v-model:checked="st.dt.inmovilizado" disabled />
    </a-form-item>

    <a-form-item name="viaPago" label="Vía pago" :rules="[{ required: true, message: 'Campo obligatorio' }]">
      <a-select v-model:value="st.dt.viaPago" :options="st.gb.viasPago" placeholder="Vía de pago" style="width: 200px">
      </a-select>
    </a-form-item>
  </div>
</template>

<!-- ------------------------------------------------------------------- -->
<script setup>
// import { message } from 'ant-design-vue';
import { httpJSONP } from '../helpers/http.js';
import { ref, computed, watch } from 'vue';
import { Modal } from 'ant-design-vue';

// Pinia
import { useStore } from '../stores/store.js';
import { message } from 'ant-design-vue';

const st = useStore();

const dataProv = ref(''); // para probar el v-model en el input de tipo texto
const loading = ref(false);
let valorInicialPedido = null;

const onFocusPedido = () => {
  valorInicialPedido = st.dt.numPedido; // Guardamos el valor inicial del número de pedido al hacer foco
};
const onBlurPedido = async () => {
  if (st.dt.numPedido.trim() === '' && st.dt.numPedido !== valorInicialPedido) {
    Modal.confirm({
      title:
        'Si elimina el número de pedido, se eliminarán también los datos del proveedor y la imputación asociada\n\n¿Quieres continuar?',
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        st.dt.codProv = '';
        st.dt.nomProv = '';
        st.dt.nifProv = '';
        st.dt.tipoImputacion = '';
        st.dt.textoElementoImputacion = '';
        st.dt.elementoImputacion = '';
        st.dt.sociedad = '';
        st.dt.inmovilizado = false;
        st.dt.bancos = [];
        st.dt.iban = '';
        st.dt.iban_pais = 'ES';
        st.dt.iban_iban = '';
        st.dt.iban_banco = '';
        st.dt.iban_sucursal = '';
        st.dt.iban_dc = '';
        st.dt.iban_cuenta = '';
      },
      onCancel: () => {
        st.dt.numPedido = valorInicialPedido; // Restauramos el valor inicial del número de pedido si se cancela
      },
    });
  }
  // Si el valor del número de pedido ha cambiado y no está vacío, hacemos la consulta
  if (st.dt.numPedido.trim() !== '' && st.dt.numPedido !== valorInicialPedido) {
    try {
      loading.value = true;
      const url = 'Busquedas_JSONP.asp';
      const payload = { numpedido: st.dt.numPedido };
      dataProv.value = await httpJSONP(url, payload);
      if (dataProv.value.proveedor === '') {
        message.error('Nº de pedido inexistente');
      }
      st.dt.codProv = dataProv.value.proveedor;
      st.dt.nomProv = dataProv.value.nomProveedor;
      st.dt.nifProv = dataProv.value.cifProveedor;
      st.dt.tipoImputacion = dataProv.value.tipoImputacion;
      st.dt.textoElementoImputacion =
        dataProv.value.elementoImputacion + ' - ' + dataProv.value.textoElementoImputacion;
      st.dt.elementoImputacion = dataProv.value.elementoImputacion;
      st.dt.sociedad = dataProv.value.sociedad + ' - ' + dataProv.value.nomSociedad;
      st.dt.inmovilizado = dataProv.value.inmovilizado === 'X';
      st.dt.bancos = dataProv.value.bancos ? dataProv.value.bancos.split(',') : [];
    } catch (error) {
      return console.error(error);
    } finally {
      loading.value = false;
    }
  }
};

const filterOption = (input, option) => {
  // Filtramos opciones del combo que contengan el texto introducido
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
</script>
<!-- ............................................... -->
<style>
/*  */
</style>
