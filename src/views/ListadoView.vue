<template>
  <!-- Los divs son necesarios para crear el salto de línea, de lo contrario si se cambiara la resolución saldrían juntos -->
  <div>
    <ListadoFiltrar />
  </div>
  <div class="mt-1">
    <!-- pasamos el parámetro listado=true para que no se muestren campos adicionales que sí se utilizan en la SC -->
    <ImputacionSociedad :listado="true" />
  </div>
  <div>
    <ProveedorCompras :listado="true" />
    <RouterLink to="/0">
      <button class="btn btn-success" style="margin-left: 300px">+ Nueva Solicitud</button>
    </RouterLink>
  </div>
  <div class="mt-2">
    <TablaSolicitudes />
  </div>
</template>

<!-- -------------- -->
<script setup>
// Hago que sea posible ir directamente a una SC a través de la URL (por ejemplo desde un e-mail)
// para ello no vale poner /:id ya que eso no lo reconoce IIS, intento cambiar el archivo web.config
// del servidor pero no funciona. Finalmente utilizo /#:id para que funcione
import { useRouter } from 'vue-router';
const router = useRouter();
// Ejemplo de url: https://web.lubasa.net/asp/sc/sc/#6
const url = window.location.href;
if (url.includes('#')) {
  const numSC = url.substring(url.indexOf('#') + 1); //obtenemos el 6 del ejemplo
  router.push('/' + numSC); //abrimos la SC
}
</script>

<!-- -------------- -->

<style scoped></style>
