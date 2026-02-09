<template>
  <!-- Loader o Spinner Bootstrap -->
  <div v-if="loading" style="text-align: center">
    <div class="spinner-border" role="status"></div>
  </div>
</template>

<script setup>
defineProps({ loading: { type: Boolean, default: false } });
</script>
