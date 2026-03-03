<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :pagination="false"
    :scroll="{ y: 200 }"
    size="small"
    rowKey="id"
    style="width: 670px"
    :row-selection="rowSelection"
    :locale="st.localeConfig"
  />
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from '../stores/store.js';

const st = useStore();

// 🔹 Variable donde guardaremos la fila seleccionada
const selectedRow = ref(null);

const columns = [
  { title: 'IBAN', dataIndex: 'iban' },
  { title: 'Banco', dataIndex: 'banco' },
  { title: 'Sucursal', dataIndex: 'sucursal' },
  { title: 'D.C.', dataIndex: 'dc' },
  { title: 'Nº Cuenta', dataIndex: 'cuenta' },
];

const data = computed(() => {
  return st.dt.bancos.map((ibanCompleto, index) => ({
    id: index + 1,
    iban: ibanCompleto.slice(0, 4),
    banco: ibanCompleto.slice(4, 8),
    sucursal: ibanCompleto.slice(8, 12),
    dc: ibanCompleto.slice(12, 14),
    cuenta: ibanCompleto.slice(14, 24),
  }));
});

// Solo se puede seleccionar una fila, por eso utilizo radio
const rowSelection = {
  type: 'radio', // solo una fila
  onChange: (selectedRowKeys, selectedRows) => {
    selectedRow.value = selectedRows[0] || null;
    console.log('Fila seleccionada:', selectedRow.value);
  },
};
</script>
