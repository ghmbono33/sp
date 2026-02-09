<template>
  <div class="componente-inline" style="height: 100px">
    <a-form-item name="observa" :rules="[{ required: st.dt.tipoPedido === 'S' }]" label="Observaciones">
      <a-textarea v-model:value="st.dt.observa" :rows="3" :maxlength="800" style="width: 1100px; resize: none" />
    </a-form-item>
    <div style="display: block !important"></div>
  </div>
</template>

<script setup>
import { useStore } from '../stores/store.js';
const st = useStore();
</script>

<style lang="scss" scoped></style>
