<template>
  <div :class="listado ? 'componente-inline-listado' : 'componente-inline'">
    <a-button @click="openModal" class="ant-outlined-indigo me-3">
      Elemento Imputación
      <template #icon>
        <SearchOutlined style="position: relative; top: -2px" />
      </template>
    </a-button>

    <a-form-item label="" name="textoElementoImputacion" :rules="[{ required: true, message: 'Campo obligatorio' }]">
      <a-input disabled v-model:value="st.dt.textoElementoImputacion" style="width: 400px; margin-left: 10px" />
    </a-form-item>

    <a-form-item label="Sociedad">
      <a-input disabled style="width: 260px" v-model:value="st.dt.sociedad" />
    </a-form-item>
    <template v-if="!listado">
      <a-form-item label="Nº Solicitud">
        <a-input disabled style="width: 75px" v-model:value="st.dt.id" />
      </a-form-item>
      <a-form-item label="Nº Pedido">
        <a-input type="text" disabled style="width: 120px" v-model:value="st.dt.numPedido" />
      </a-form-item>
    </template>
    <!-- Modal para obtener el elemento de imputación -->
    <a-modal
      v-model:visible="modalOpen"
      class="dark-modal"
      @ok="onOk"
      ok-text="Aceptar"
      cancel-text="Cancelar"
      width="500px"
    >
      <template #title>
        <div class="dark-modal-title">
          <span>IMPUTACIÓN</span>
        </div>
      </template>
      <a-form ref="formRef" name="modalImputacion" layout="vertical" :model="formState">
        <div class="ant-row">
          <div class="ant-col ant-col-10">
            <a-form-item
              name="tipoImputacion"
              label=" Elemento Imputación"
              :rules="[{ required: true, message: 'Campo Obligatorio' }]"
            >
              <a-select
                ref="refTipoImputacion"
                v-model:value="formState.tipoImputacion"
                :options="optImputacion"
                placeholder="Selecciona una opción"
                label-in-value
                style="width: 185px"
                @change="changeTipoImputacion"
              ></a-select>
            </a-form-item>
          </div>

          <div class="ant-col ant-col-1"></div>
          <div class="ant-col ant-col-13">
            <a-form-item
              label="Código"
              name="buscar"
              :rules="[{ required: true, min: 5, message: 'Indique al menos 5 caracteres' }]"
            >
              <a-input
                v-model:value="formState.buscar"
                @keydown.enter.prevent
                ref="refBuscarImputacion"
                :disabled="!hayTipoSelec"
                @blur="fillData"
              />
            </a-form-item>
          </div>
        </div>

        <Loader :loading="loading" />

        <a-form-item
          label="Selecciona elemento de Imputación"
          name="seleccion"
          :rules="[{ required: true, message: 'Por favor, selecciona una opción' }]"
        >
          <!-- CLASES DE BOOTSTRAP, ES UNA ESPECIE DE LISTBOX QUE NO LO HE ENCONTRADO EN ANT DESIGN -->
          <select
            v-model="formState.seleccion"
            :disabled="formState.buscar.length < 5"
            id="listaImputac"
            class="form-select mb-3"
            size="5"
            style="height: 150px"
            @change="getInfo"
          >
            <option v-for="opcion in opciones" :value="opcion.codigo" :key="opcion.codigo">{{ opcion.codigo }}</option>
          </select>
        </a-form-item>

        <a-form-item label="Descripción" name="descripcion">
          <a-input disabled v-model:value="formState.descripcion" />
        </a-form-item>

        <a-form-item label="Sociedad" name="sociedad">
          <a-input disabled v-model:value="formState.sociedad" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<!-- ----------------------------- -->
<script setup>
import { message } from 'ant-design-vue';
import { computed, nextTick, reactive, ref } from 'vue';
import { httpJSONP } from '../helpers/http';

// Pinia Store
import { useStore } from '../stores/store.js';
const st = useStore();
// Icono lupa
import { SearchOutlined } from '@ant-design/icons-vue';

// Props
defineProps({
  listado: {
    type: Boolean,
    default: false,
  },
});
const loading = ref(false);
const formRef = ref();
const opciones = ref([]);
const refBuscarImputacion = ref(null); //referencia al input de buscar la imputación
const refTipoImputacion = ref(null); //referencia a seleccionar tipo de imputación
const modalOpen = ref(false);
// se necesita la estructura label, value para el a-option de Ant Design
const optImputacion = [
  { label: 'Elemento PEP - Obra', value: 'P' },
  { label: 'Centro Coste', value: 'C' },
  { label: 'Orden', value: 'O' },
];

const formState = reactive({
  buscar: '',
  seleccion: '',
  sociedad: '',
  descripcion: '',
});

const hayTipoSelec = computed(() => {
  //Booleano que nos dice si hay algún tipo seleccionado (pep, orden, ceco)
  return !!formState.tipoImputacion; //doble negación para que pase a booleano
});

const openModal = () => {
  // Eliminamos los posibles opciones por si se hubiera entrado anteriormente
  opciones.value = [];
  modalOpen.value = true;
  // Utilizamos nextTick para asegurarnos de que el DOM se ha actualizado antes de ejecutar una acción
  // otra opción es con setTimeout y esperar algún milisegundo
  nextTick(() => {
    formRef.value.resetFields();
    // // Foco en el primer campo (el de buscar el elemento de imputación)
    refTipoImputacion.value.focus();
  });
};

const fillData = async () => {
  //No permitimos buscar un elemento con menos de 5 caracteres ya que devolvería muchos registros
  if (formState.buscar.length < 5) return;

  try {
    loading.value = true;
    const url = 'Busquedas_JSONP.asp';
    const payload = { imputacion: formState.tipoImputacion.value + formState.buscar };
    const data = await httpJSONP(url, payload);
    opciones.value = data.map((e) => ({
      codigo: e.elementoImputacion /* necesario para el select */,
      descripcionCebe: e.descripcionCebe,
      sociedad: e.sociedad,
      nomSociedad: e.nomSociedad,
    }));
  } catch (error) {
    console.error(error);
    return; // message.error("Error al acceder a la Base de Datos");
  } finally {
    loading.value = false;
  }
  if (opciones.value.length === 1) {
    // Sólo hay uno se marcará automáticamente y actualizamos la información
    formState.seleccion = opciones.value[0].codigo;
    getInfo();
  }
};

const getInfo = () => {
  // obtenemos la información de la opción seleccionada
  const opcion = opciones.value.find((e) => e.codigo === formState.seleccion);
  if (opcion) {
    formState.descripcion = opcion.codigo + ' - ' + opcion.descripcionCebe;
    formState.sociedad = opcion.sociedad + ' - ' + opcion.nomSociedad;
  }
};

const changeTipoImputacion = () => {
  // Es posible que el usuario haya introducido previamente otro tipo de imputación por lo
  // que cada vez que cambie éste dejaremos todos los campos en blanco para evitar como
  // ocurrió en una ocasión que un nº de elemento pep se guardó como centro de coste
  const tipoImput = formState.tipoImputacion; //guardo valor seleccionado
  formRef.value.resetFields(); //limpio formulario
  opciones.value = []; //vaciamos opciones de elementos de imputación a elegir
  formState.tipoImputacion = tipoImput; //restauro valor
  // enviamos el foco al código a buscar
  nextTick(() => refBuscarImputacion.value.focus());
};
const onOk = async () => {
  try {
    // lanzamos las validaciones
    const values = await formRef.value.validateFields();
    // Guardamos en el store
    st.dt.tipoImputacion = formState.tipoImputacion.value;
    st.dt.elementoImputacion = values.elementoImputacion;
    st.dt.sociedad = values.sociedad;
    st.dt.elementoImputacion = values.seleccion;
    st.dt.textoElementoImputacion = values.descripcion;
    // cerramos el modal
    modalOpen.value = false;
  } catch (error) {
    message.error('Formulario incompleto.', 1.5);
  }
};
</script>
<style scoped>
.required-label {
  color: red;
}
</style>
