<template>
  <div class="componente-inline">
    <a-form-item name="tipoPedido" label="Tipo Pedido">
      <a-select
        v-model:value="st.dt.tipoPedido"
        :options="opcTipo"
        placeholder="Selecciona opción"
        style="width: 175px"
      >
      </a-select>
    </a-form-item>

    <a-form-item name="prioridad" label="Prioridad">
      <a-select
        v-model:value="st.dt.prioridad"
        :options="opcPrioridad"
        placeholder="Selec. opción"
        style="width: 130px"
      >
      </a-select>
    </a-form-item>
    <!-- @keydown.enter.prevent para que no haga nada al pulsar intro, de lo contrario se ejecutaría un submit  -->
    <a-form-item name="fecEntrega" :rules="[{ required: st.dt.tipoPedido === 'S' }]" label="F. Entrega">
      <a-input
        type="date"
        style="width: 130px"
        v-model:value="st.dt.fecEntrega"
        @keydown.enter.prevent
        @blur="fecAnteriorSolicitud(st.dt.fecEntrega)"
      />
    </a-form-item>

    <a-form-item name="fecInicio" :rules="[{ required: st.dt.tipoPedido === 'V' }]" label="F. Inicio">
      <a-input
        type="date"
        style="width: 130px"
        v-model:value="st.dt.fecInicio"
        @keydown.enter.prevent
        @blur="fecAnteriorSolicitud(st.dt.fecInicio)"
      />
    </a-form-item>

    <a-form-item name="fecFin" :rules="[{ required: st.dt.tipoPedido === 'V' }]" label="F. Fin">
      <a-input
        type="date"
        style="width: 130px"
        v-model:value="st.dt.fecFin"
        @keydown.enter.prevent
        @blur="fecAnteriorSolicitud(st.dt.fecFin)"
      />
    </a-form-item>
    <a-form-item label="F. Solicitud" class="ms-3">
      <a-input type="date" disabled style="width: 120px" v-model:value="st.dt.fecSolicitud" />
    </a-form-item>
  </div>
</template>

<!-- ------------------------------------------------------------------- -->
<script setup>
import { message } from 'ant-design-vue';
import { ref } from 'vue';
// Pinia
import { useStore } from '../stores/store.js';
const st = useStore();

import { fechaVacia } from '../helpers/fechas';

const opcTipo = [
  { label: 'Inmovilizado', value: 'I' },
  { label: 'Suministro', value: 'S' },
  { label: 'Servicio', value: 'V' },
];

// En este caso necesito ref ya que por defecto viene la prioridad Media y sin ref no funciona
const opcPrioridad = ref([
  { label: 'Alta', value: '1' },
  { label: 'Media', value: '2' },
  { label: 'Baja', value: '3' },
]);

const fecAnteriorSolicitud = (fecha) => {
  // Comprueba si la fecha es anterior a la fecha de solicitud y si esta no existe a hoy,
  // devuelve true si es así
  if (fechaVacia(fecha)) return false; //fecha en blanco no se comprueba
  // Convertir la fecha de texto a objeto Date
  const partesFecha = fecha.split('-');
  const fechaComparar = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);
  let fecSolicitud = new Date(st.dt.fecSolicitud);
  // En la fecha de solicitud por defecto se guarda también la hora, la dejamos a 0  ó la comparación será incorrecta
  fecSolicitud.setHours(0, 0, 0, 0);
  // Comparar las fechas
  if (fechaComparar < fecSolicitud) {
    message.error('Las fechas deberían ser anteriores a la fecha de solicitud', 1.5);
  }
};
</script>
<!-- ............................................... -->
<style>
/*  */
</style>
