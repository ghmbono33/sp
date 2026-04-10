<template>
  <div style="margin-top: 25px"></div>

  <div class="componente-inline">
    <a-form-item label="Estado" v-if="st.dt.tipoSolicitud === '2' || st.dt.tipoSolicitud === '3'">
      <a-select v-model:value="st.dt.estado" style="width: 230px">
        <a-select-option value="1"
          >Pdte Aprobación Dr {{ st.dt.tipoSolicitud === '2' ? 'Compras' : 'Negocio' }}</a-select-option
        >
        <a-select-option value="2">Aprobada</a-select-option>
        <!-- opción inhabilitada -->
        <a-select-option value="3" disabled>Rechazada</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item
      name="fec_pago"
      label="Fecha Pago"
      :rules="[{ required: st.dt.viaPago, message: 'Campo obligatorio' }]"
    >
      <a-input type="date" style="width: 130px" v-model:value="st.dt.fec_pago" />
    </a-form-item>
    <a-form-item name="justif_pago" label="Requiere Justificante de Pago">
      <a-checkbox v-model:checked="st.dt.justif_pago" />
    </a-form-item>
  </div>
  <div>
    <a-form-item name="observa" :rules="[{ required: st.dt.tipoSolicitud === '4' }]" label="Observaciones">
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
