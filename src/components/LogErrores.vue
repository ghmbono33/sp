<template>
  <!-- Modal para obtener el elemento de imputación -->
  <a-modal
    visible="true"
    class="dark-modal"
    @ok="$emit('ocultarLogErrores')"
    @cancel="$emit('ocultarLogErrores')"
    ok-text="Aceptar"
    :cancelButtonProps="{ style: { display: 'none' } }"
    width="550px"
  >
    <template #title>
      <div class="dark-modal-title">
        <span>VALIDACIÓN DE ERRORES</span>
      </div>
    </template>
    <ul>
      <li v-for="(err, index) in errores" :key="index">{{ err }}</li>
    </ul>
  </a-modal>
</template>
<script setup>
const params = defineProps(['errores']);
</script>
