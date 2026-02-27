<template>
  <!-- <a-layout>
    <a-layout-header>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="horizontal" :style="{ lineHeight: '64px' }">
        <RouterLink to="/">
          <a-menu-item key="home"> Crear </a-menu-item>
        </RouterLink>
        <RouterLink to="/list">
          <a-menu-item key="list"> Listado </a-menu-item>
        </RouterLink>
        <RouterLink to="/pruebas">
          <a-menu-item key="pruebas"> Pruebas </a-menu-item>
        </RouterLink>
      </a-menu>
    </a-layout-header>
    <a-layout-content class="contenedor">
      <RouterView />
    </a-layout-content>
  </a-layout> -->
  <header>Solicitud de Pago</header>
  <div class="contenedor">
    <RouterView />
  </div>
</template>

<!-- ...................................................... -->
<script setup>
import { RouterView } from 'vue-router';

//NOTA: Tanto selectedKeys como el route y watch que se muestran a continuación comentado se pueden utilizar junto
//al a-layout que hay arriba cuando necesitemos un menú con varias opciones. No lo he borrado para que me sirva
//de ejemplo de futuros proyectos.

// import { ref, watch } from 'vue';
// import { RouterView, useRoute } from 'vue-router';

//selectedKdeys se utiliza en el menú y se actualiza en el watch
// const selectedKeys = ref([]);
// const route = useRoute();

// Con watch observamos el valor de  route.name que cambia según la opción del menú seleccionada
// Al cambiar se actualiza el ref selectedKeys
// watch(
//   () => route.name,
//   () => {
//     selectedKeys.value = [route.name]; //va [] porque es un array
//   }
// );
</script>

<style>
header {
  background-color: var(--naranja);
  color: white;
  width: 100%;
  padding: 0.3rem 10rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
}
.contenedor {
  width: 100%;
  padding: 15px 30px;
}
</style>
