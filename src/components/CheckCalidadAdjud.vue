<template>
  <div class="componente-inline" style="height: 30px">
    <a-tooltip
      placement="bottomLeft"
      title="En el caso de adjudicar la compra directamente, el solicitante adjunta el comparativo de acuerdo al procedimiento
      de Compras vigente y si procede la Declaraciones de Prestaciones (Marcado CE) o Certificados de Calidad de los
      materiales a adquirir"
    >
      <a-checkbox v-model:checked="st.dt.calidad">
        En el caso de adjudicar la compra directamente el solicitante adjunta el comparativo...</a-checkbox
      >
    </a-tooltip>
    <a-checkbox v-model:checked="st.dt.adjNeg" class="ms-5">El Solicitante desea adjudicar el negocio</a-checkbox>
  </div>
</template>

<script setup>
import { useStore } from '../stores/store.js';
const st = useStore();
</script>

<style>
label {
  font-size: 14px !important;
  /* font-weight: 500; */
}

label.ant-checkbox-wrapper {
  height: 10px;
}
</style>
