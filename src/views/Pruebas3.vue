<template>
  <div>{{ $route.params.nombre }} - {{ $route.name }}</div>
  <button @click="goPruebas2">Ir a pruebas2</button>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
console.log(route.params.nombre);
const goPruebas2 = () => {
  router.push('/pruebas2');
};
</script>

<style scoped></style>
