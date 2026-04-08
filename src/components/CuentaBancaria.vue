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

  <div>
    <a-form-item label="Cuenta">
      <a-select v-model:value="st.dt.iban_pais" style="width: 150px">
        <a-select-option value="ES">Española</a-select-option>
        <a-select-option value="INT">Extranjera</a-select-option>
      </a-select>
    </a-form-item>
    <div class="componente-inline">
      <!-- 🇪🇸 MODO ESPAÑOL -->
      <template v-if="st.dt.iban_pais === 'ES'">
        <a-form-item label="IBAN">
          <a-input v-model:value="st.dt.iban_iban" maxlength="4" placeholder="ES00" style="width: 80px" />
        </a-form-item>
        <a-form-item label="Banco">
          <a-input v-model:value="st.dt.iban_banco" maxlength="4" style="width: 80px" />
        </a-form-item>
        <a-form-item label="Sucursal">
          <a-input v-model:value="st.dt.iban_sucursal" maxlength="4" style="width: 80px" />
        </a-form-item>
        <a-form-item label="D.C.">
          <a-input v-model:value="st.dt.iban_dc" maxlength="2" style="width: 60px" />
        </a-form-item>
        <a-form-item label="Cuenta">
          <a-input v-model:value="st.dt.iban_cuenta" maxlength="10" style="width: 120px" />
        </a-form-item>
      </template>

      <!-- 🌍 MODO INTERNACIONAL -->
      <template v-else>
        <a-form-item label="IBAN">
          <a-input v-model:value="st.dt.iban" maxlength="34" style="width: 300px" />
        </a-form-item>
      </template>
    </div>
  </div>
</template>

<script setup>
/* ---------------- 1️⃣ Importaciones ---------------- */
import { ref, reactive, computed, watch } from 'vue';
import { useStore } from '../stores/store.js';
const st = useStore();

const selectedRowKeys = ref([]); // IDs de filas seleccionadas en la tabla

/* ---------------- 3️⃣ Computed y estructuras derivadas ---------------- */
const columns = [
  { title: 'IBAN', dataIndex: 'iban' },
  { title: 'Banco', dataIndex: 'banco' },
  { title: 'Sucursal', dataIndex: 'sucursal' },
  { title: 'D.C.', dataIndex: 'dc' },
  { title: 'Nº Cuenta', dataIndex: 'cuenta' },
];

// Función para transformar un IBAN completo en objeto fila
const parseIBANToRow = (ibanCompleto, id) => ({
  id,
  iban: ibanCompleto.slice(0, 4),
  banco: ibanCompleto.slice(4, 8),
  sucursal: ibanCompleto.slice(8, 12),
  dc: ibanCompleto.slice(12, 14),
  cuenta: ibanCompleto.slice(14, 24),
});

const data = computed(() => st.dt.bancos.map((ibanCompleto, index) => parseIBANToRow(ibanCompleto, index + 1)));

const rowSelection = computed(() => ({
  type: 'radio',
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys, selectedRows) => {
    selectedRowKeys.value = keys;
    seleccionarBanco(selectedRows[0]);
  },
}));

/* ---------------- 4️⃣ Funciones principales ---------------- */
const seleccionarBanco = (selectedRow) => {
  if (!selectedRow) return;
  if (selectedRow.iban.substring(0, 2) === 'ES') {
    st.dt.iban_pais = 'ES';
    st.dt.iban_iban = selectedRow.iban;
    st.dt.iban_banco = selectedRow.banco;
    st.dt.iban_sucursal = selectedRow.sucursal;
    st.dt.iban_dc = selectedRow.dc;
    st.dt.iban_cuenta = selectedRow.cuenta;
  } else {
    st.dt.iban_pais = 'INT';
    ibanINT.value = selectedRow.iban + selectedRow.banco + selectedRow.sucursal + selectedRow.dc + selectedRow.cuenta;
  }
};

/* ---------------- 5️⃣ Watchers y efectos secundarios ---------------- */
watch(
  () => st.dt.bancos,
  (bancos) => {
    if (bancos && bancos.length === 1) {
      // Si solo hay una cuenta bancaria, la seleccionamos automáticamente
      const row = parseIBANToRow(bancos[0], 1);
      selectedRowKeys.value = [row.id];
      seleccionarBanco(row);
    }
  },
  { immediate: true },
);
</script>
