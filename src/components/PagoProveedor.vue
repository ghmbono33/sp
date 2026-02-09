<template>
  <div class="diferente-sociedad" v-if="!st.dt.mismaSocProv && st.dt.codProv">
    Para Compras: El Proveedor no existe en la Sociedad {{ st.dt.sociedad }}
  </div>
  <div class="componente-inline">
    <!-- No se requieren si se delega en el proveedor -->
    <a-form-item name="viaPago" :rules="[{ required: !st.dt.delegoProv }]" label="Forma de Pago">
      <a-input
        style="width: 375px"
        v-model:value="st.dt.viaPago"
        @keydown.enter.prevent
        :disabled="pagoDisabled"
        maxlength="30"
      />
    </a-form-item>
    <a-form-item name="condPago" :rules="[{ required: !st.dt.delegoProv }]" label="Plazo de Pago">
      <a-input
        style="width: 375px"
        v-model:value="st.dt.condPago"
        @keydown.enter.prevent
        :disabled="pagoDisabled"
        maxlength="50"
      />
    </a-form-item>
    <a-form-item
      v-if="st.dt.tipoPedido === 'S'"
      name="portes"
      label="Portes"
      :rules="[{ required: st.dt.tipoPedido === 'S', message: 'Campo Obligatorio' }]"
    >
      <a-select
        v-model:value="st.dt.portes"
        :options="optPortes"
        placeholder="Selecciona una opción"
        style="width: 135px"
      ></a-select>
    </a-form-item>
  </div>
</template>

<script setup>
import { computed } from 'vue';
// Pinia
import { useStore } from '../stores/store.js';
const st = useStore();

const pagoDisabled = computed(() => st.dt.mismaSocProv || !st.dt.codProv);

// se necesita la estructura label, value para el a-option de Ant Design
const optPortes = [
  { label: 'Pagados', value: 'P' },
  { label: 'Debidos', value: 'D' },
];
</script>

<style scoped>
.diferente-sociedad {
  font-size: 0.8rem;
  margin-left: 400px;
  margin-top: -20px;
  color: indigo;
  font-weight: bold;
}
</style>
