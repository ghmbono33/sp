<template>
  <div>
    <div class="componente-inline">
      <a-form-item name="dirEntrega" :rules="[{ required: requerido }]" label="Dirección de Entrega">
        <a-input style="width: 900px" maxlength="100" v-model:value="st.dt.dirEntrega" @keydown.enter.prevent />
      </a-form-item>
    </div>
  </div>
  <div>
    <div class="componente-inline">
      <a-form-item name="contacto" :rules="[{ required: requerido }]" label="Contacto de Entrega">
        <a-input style="width: 900px" maxlength="100" v-model:value="st.dt.contacto" @keydown.enter.prevent />
      </a-form-item>
    </div>
  </div>
</template>

<script setup>
import { useStore } from '../stores/store.js';
import { computed } from 'vue';

const st = useStore();
const requerido = computed(() => st.dt.tipoSolicitud === 'S');
</script>
