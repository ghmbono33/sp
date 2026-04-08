<template>
  <a-input
    type="text"
    @input="valor = valor.replace(/\D/g, '')"
    v-model:value="valor"
    maxlength="5"
    placeholder="Máx. 5 caracteres"
  />
  <div class="componente-inline">
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
  </div>
  <div class="componente-inline">
    <a-form-item label="Cuenta">
      <a-select v-model:value="tipo" style="width: 150px">
        <a-select-option value="ES">Española</a-select-option>
        <a-select-option value="INT">Extranjera</a-select-option>
      </a-select>
    </a-form-item>
    <!-- 🇪🇸 MODO ESPAÑOL -->
    <template v-if="tipo === 'ES'">
      <a-form-item label="IBAN" :validate-status="statusES.iban" :help="errorsES.iban">
        <a-input v-model:value="formES.iban" maxlength="4" placeholder="ES00" style="width: 100px" />
      </a-form-item>
      <a-form-item label="Banco" :validate-status="statusES.banco" :help="errorsES.banco">
        <a-input v-model:value="formES.banco" type="number" class="no-spinner" maxlength="4" style="width: 100px" />
      </a-form-item>
      <a-form-item label="Sucursal" :validate-status="statusES.sucursal" :help="errorsES.sucursal">
        <a-input v-model:value="formES.sucursal" type="number" class="no-spinner" maxlength="4" style="width: 100px" />
      </a-form-item>
      <a-form-item label="D.C." :validate-status="statusES.dc" :help="errorsES.dc">
        <a-input v-model:value="formES.dc" type="number" class="no-spinner" maxlength="2" style="width: 100px" />
      </a-form-item>
      <a-form-item label="Cuenta" :validate-status="statusES.cuenta" :help="errorsES.cuenta">
        <a-input v-model:value="formES.cuenta" type="number" class="no-spinner" maxlength="10" style="width: 100px" />
      </a-form-item>
    </template>

    <!-- 🌍 MODO INTERNACIONAL -->
    <template v-else>
      <a-form-item label="IBAN" :validate-status="statusINT" :help="errorINT">
        <a-input v-model:value="ibanINT" maxlength="34" style="width: 300px" />
      </a-form-item>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
// Pinia
import { useStore } from '../stores/store.js';
const st = useStore();

const tipo = ref('ES'); //País

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

/* =========================
   🇪🇸 FORMULARIO ESPAÑA
========================= */

const formES = reactive({
  iban: '',
  banco: '',
  sucursal: '',
  dc: '',
  cuenta: '',
});

const errorsES = reactive({
  iban: '',
  banco: '',
  sucursal: '',
  dc: '',
  cuenta: '',
});

watch(formES, validarES, { deep: true });

function validarES() {
  Object.keys(errorsES).forEach((k) => (errorsES[k] = ''));

  if (!/^ES\d{2}$/.test(formES.iban)) errorsES.iban = 'Debe ser ES + 2 dígitos';

  if (!/^\d{4}$/.test(formES.banco)) errorsES.banco = '4 dígitos';

  if (!/^\d{4}$/.test(formES.sucursal)) errorsES.sucursal = '4 dígitos';

  if (!/^\d{2}$/.test(formES.dc)) errorsES.dc = '2 dígitos';

  if (!/^\d{10}$/.test(formES.cuenta)) errorsES.cuenta = '10 dígitos';

  if (Object.values(errorsES).some((e) => e)) return;

  const completo = formES.iban + formES.banco + formES.sucursal + formES.dc + formES.cuenta;

  if (!mod97(completo)) errorsES.iban = 'IBAN español no válido';
}

const statusES = {
  iban: computed(() => getStatus(errorsES.iban)),
  banco: computed(() => getStatus(errorsES.banco)),
  sucursal: computed(() => getStatus(errorsES.sucursal)),
  dc: computed(() => getStatus(errorsES.dc)),
  cuenta: computed(() => getStatus(errorsES.cuenta)),
};

/* =========================
   🌍 FORMULARIO INTERNACIONAL
========================= */

const ibanINT = ref('');
const errorINT = ref('');

watch(ibanINT, validarINT);

function validarINT() {
  errorINT.value = '';
  if (!ibanINT.value) return;

  const clean = ibanINT.value.replace(/\s+/g, '').toUpperCase();

  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(clean)) {
    errorINT.value = 'Formato incorrecto';
    return;
  }

  if (!mod97(clean)) errorINT.value = 'IBAN no válido';
}

const statusINT = computed(() => getStatus(errorINT.value));

/* =========================
   UTILIDADES
========================= */

function mod97(iban) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged
    .split('')
    .map((c) => (isNaN(c) ? c.charCodeAt(0) - 55 : c))
    .join('');
  return BigInt(numeric) % 97n === 1n;
}

function getStatus(error) {
  if (!error) return '';
  return 'error';
}
</script>

<style>
/* para que no salga en los input-number los botones de subir y bajar */
.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
