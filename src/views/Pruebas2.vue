<template>
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
      style="width: 130px"
    />
  </a-form-item>
</template>

<script setup>
import { reactive, computed } from 'vue';

const st = reactive({
  dt: {
    importe: 0,
  },
});

const opcImputacionBase = [
  { label: 'Pedido', value: 'P' },
  { label: 'Elem. Imputación', value: 'I' },
];

const opcImputacionComputed = computed(() =>
  opcImputacionBase.map((op) => ({
    ...op,
    disabled: op.value === 'I' && st.dt.importe >= 3000,
  })),
);
</script>
