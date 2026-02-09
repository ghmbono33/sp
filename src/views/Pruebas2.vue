<template>
  <div>
    <h1>Hola</h1>
    <div v-for="fruta in frutas">
      <b>{{ fruta.nombre }}</b> - {{ fruta.color }}
      <div class="propiedades" v-for="(valor, propiedad) in fruta">
        <b>{{ propiedad }}</b> - {{ valor }}
      </div>
    </div>
    <div class="btn">Botón</div>
  </div>
</template>

<script setup>
const frutas = [
  {
    nombre: 'pera',
    color: 'verde',
  },
  {
    nombre: 'fresa',
    color: 'rojo',
  },
  {
    nombre: 'plátano',
    color: 'amarillo',
  },
];
</script>

<style scoped>
.propiedades {
  margin-left: 20px;
}
.btn {
  padding: 0;
  height: 80px;
  width: 80px;
  line-height: 80px;
  text-align: center;
  background-color: red;
  border-radius: 50%;
  position: relative;
  position: absolute;
  right: 50px;
  bottom: 50px;
}
</style>
