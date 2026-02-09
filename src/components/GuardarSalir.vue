<template>
  <div class="center">
    <!-- G U A R D A R -->
    <a-button
      size="large"
      type="primary"
      html-type="submit"
      shape="round"
      class="ant-outlined-success"
      :disabled="!!st.dt.numPedido || st.dt.guardando || cambiosGuardados"
    >
      <template #icon>
        <SaveOutlined style="position: relative; top: -2px" />
      </template>
      Guardar
    </a-button>
    <!-- S A L I R -->
    <a-button size="large" @click="atras" type="primary" shape="round" class="enabled ant-outlined-secondary ms-5">
      <template #icon>
        <RollbackOutlined style="position: relative; top: -2px" />
      </template>
      Salir
    </a-button>
  </div>
</template>

<!-- ----------------------------------------- -->

<script setup>
// Pinia
import { RollbackOutlined, SaveOutlined } from '@ant-design/icons-vue';
import { useStore } from '../stores/store';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const st = useStore();
const atras = () => {
  // vamos a la página anterior (el listado de solicitudes)
  // history.go(-1);
  router.replace('/');
};
const cambiosGuardados = computed(() => JSON.stringify(st.dt) === JSON.stringify(st.dtInicial));
</script>
<!-- ----------------------------------------- -->

<style scoped>
.center {
  display: inline-block;
  margin-left: 300px;
}
</style>
