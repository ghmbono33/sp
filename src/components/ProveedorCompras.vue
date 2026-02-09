<template>
  <div :class="listado ? 'componente-inline-listado' : 'componente-inline'">
    <!-- Botón que abre el modal para buscar al proveedor -->
    <!-- Deberá de haberse seleccionado antes el elemento de imputación para conocer la sociedad -->

    <a-button @click="openModal" :disabled="disabledOpenModal" :title="tituloBoton" class="ant-outlined-indigo me-3">
      Proveedor
      <template #icon>
        <SearchOutlined style="position: relative; top: -2px" />
      </template>
    </a-button>
    <!-- Mostramos la información seleccionada en el modal -->
    <!-- Código -->
    <a-form-item label="Código" name="codProv" :rules="[{ required: !st.dt.delegoProv && !props.listado }]">
      <a-input disabled v-model:value="st.dt.codProv" style="width: 120px; margin-left: 10px" />
    </a-form-item>
    <!-- Nombre -->
    <a-form-item label="Nombre">
      <a-input disabled style="width: 380px" v-model:value="st.dt.nomProv" />
    </a-form-item>

    <!-- NIF -->
    <a-form-item label="NIF">
      <a-input disabled style="width: 120px" v-model:value="st.dt.nifProv" />
    </a-form-item>

    <!-- Check que si se marca se deshabilitará la posibilidad de introducir el Proveedor -->
    <a-checkbox v-if="!listado" v-model:checked="st.dt.delegoProv" class="ms-3" @click="delegoCompras"
      >Delego la elección en compras</a-checkbox
    >

    <!-- Modal del PROVEEDOR -->
    <a-modal
      v-model:visible="modalOpen"
      @ok="onOk"
      ok-text="Aceptar"
      class="dark-modal"
      cancel-text="Cancelar"
      width="750px"
    >
      <template #title>
        <div class="dark-modal-title">
          <span>PROVEEDOR</span>
        </div>
      </template>
      <a-form ref="formRef" name="modalProv" layout="vertical" :model="formState">
        <!-- BÚSQUEDA POR CÓDIGO, NOMBRE, NIF -->
        <div class="card p-3 mb-2">
          <h6 class="mt-0 mb-2 text-danger">Buscar por:</h6>
          <a-space size="middle">
            <!-- Código -->
            <a-form-item :label="Código" name="busqCodigo">
              <a-input
                v-model:value="formState.busqCodigo"
                @keydown.enter.prevent
                placeholder="Código"
                style="width: 110px"
                @blur="fillData('C')"
              />
            </a-form-item>
            <!-- Nombre -->
            <a-form-item
              :label="Nombre"
              name="busqNombre"
              :rules="[{ min: 3, message: 'Indique al menos 3 caracteres' }]"
            >
              <a-input
                type="text"
                placeholder="Nombre"
                @keydown.enter.prevent
                style="width: 290px"
                v-model:value="formState.busqNombre"
                @blur="fillData('N')"
              />
            </a-form-item>

            <!-- NIF -->
            <a-form-item :label="NIF" name="busqNIF" :rules="[{ min: 3, message: 'Indique al menos 3 caracteres' }]">
              <a-input
                v-model:value="formState.busqNIF"
                @keydown.enter.prevent
                placeholder="NIF"
                style="width: 135px"
                @blur="fillData('I')"
              />
            </a-form-item>
          </a-space>
        </div>
        <Loader :loading="loading" style="margin-left: 30px" />

        <a-form-item label="Selecciona Proveedor" name="seleccion">
          <select
            v-model="formState.seleccion"
            :disabled="disabledSelect"
            id="listaProv"
            class="form-select mb-3"
            size="5"
            style="height: 150px"
            @change="getInfo"
          >
            <option v-for="opcion in opciones" :key="opcion.codigo" :value="opcion.codigo">
              {{ opcion.nombre }}
            </option>
          </select>
        </a-form-item>
        <!-- La posibilidad de crear un nuevo cliente solo estará en la SC no en el listado -->
        <template v-if="!listado">
          <div style="text-align: center">
            <button @click="nuevoProv" type="button" class="btn btn-sm btn-outline-success margen-negativo">
              + Nuevo Proveedor
            </button>
          </div>
          <!-- DATOS DEL PROVEEDOR  -->
          <a-input-group compact>
            <a-form-item label="Código" name="codigo">
              <a-input disabled v-model:value="formState.codigo" style="width: 110px" class="me-2" />
            </a-form-item>
            <a-form-item label="Nombre del Proveedor" name="nombre">
              <a-input
                :disabled="disabledCpos"
                v-model:value="formState.nombre"
                @keydown.enter.prevent
                ref="nomProv"
                style="width: 420px"
                class="me-2"
              />
            </a-form-item>
            <a-form-item label="NIF" name="nif">
              <a-input
                :disabled="disabledCpos"
                v-model:value="formState.nif"
                @keydown.enter.prevent
                style="width: 140px"
                class="me-2"
                @blur="checkNif"
              />
            </a-form-item>
          </a-input-group>
        </template>
      </a-form>
    </a-modal>
  </div>
</template>

<!--    -------------------------------------------------------------   -->
<!--    -------------------------------------------------------------   -->
<!--    -------------------------------------------------------------   -->

<script setup>
import { SearchOutlined } from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import { computed, reactive, ref, nextTick } from 'vue';
import { validarDNI, validarNif } from '../helpers/dniNif';
import { httpJSONP } from '../helpers/http';
// Pinia
import { useStore } from '../stores/store.js';
const st = useStore();

// Props
const props = defineProps({
  listado: {
    type: Boolean,
    default: false,
  },
});
const loading = ref(false);
const nomProv = ref();
const formRef = ref();
const opciones = ref([]);
const disabledSelect = ref(true);
const disabledCpos = ref(true);
const modalOpen = ref(false);

const formState = reactive({
  busqCodigo: '',
  busqNombre: '',
  busqNIF: '',
  seleccion: '',
  codigo: '',
  nombre: '',
  nif: '',
});

const tituloBoton = computed(() => (st.dt.sociedad || props.listado ? '' : 'Se precisa el Elemento de Imputación'));
const disabledOpenModal = computed(() => {
  if (props.listado) return false; //Estará habilitado en el listado
  return st.dt.delegoProv || !st.dt.sociedad;
});

const delegoCompras = () => {
  //hay que tener en cuenta que al hacer click st.dt.delegoProv todavía tiene el valor anterior
  //o sea, si estaba en false y lo queremos poner en true todavía vale false, por eso pongo !st.dt.DelegoProv
  if (!st.dt.delegoProv && st.dt.codProv) {
    Modal.confirm({
      title: 'Ya hay un proveedor informado. ¿Continuar? ',
      // content: "¿Continuar?",
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        // Dejamos en blanco los datos del proveedor
        // Se puede hacer de ambas formas:
        // st.dt.codProv = '';  st.dt.nomProv = '';  st.dt.nifProv = '';
        [st.dt.codProv, st.dt.nomProv, st.dt.nifProv] = Array(3).fill('');
      },
      onCancel: () => {
        // no quiere delegar el proveedor en compras
        st.dt.delegoProv = false;
      },
    });
  }
};
const openModal = (value) => {
  // Eliminamos los posibles opciones por si se hubiera entrado anteriormente
  opciones.value = [];
  modalOpen.value = true;
  nextTick(() => {
    // inicializamos los campos
    disabledCpos.value = true;
    formRef.value.resetFields();
    // asignación masiva
    [formState.busqCodigo, formState.busqNombre, formState.busqNIF] = ['', '', ''];
  });
};

const fillData = async (tipo) => {
  try {
    loading.value = true;
    const url = 'Busquedas_JSONP.asp';
    const buscar = tipo === 'C' ? formState.busqCodigo : tipo === 'N' ? formState.busqNombre : formState.busqNIF;
    if (buscar.trim() === '') return;
    if ((tipo === 'N' || tipo === 'I') && buscar.trim().length < 3) {
      return;
    }
    const payload = { proveedor: tipo + buscar.trim() };
    const data = await httpJSONP(url, payload);
    //no es necesario ya que tiene la misma estructura..., borrar más adelante
    // opciones.value = data.map((e) => ({
    //   codigo: e.codigo /* necesario para el select */,
    //   nombre: e.nombre /* necesario para el select */,
    //   nif: e.nif,
    // }));
    opciones.value = [...data];
  } catch (error) {
    return console.error(error);
  } finally {
    loading.value = false;
  }
  disabledSelect.value = false;
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
    disabledCpos.value = true;
    formState.codigo = opcion.codigo;
    formState.nombre = opcion.nombre;
    formState.nif = opcion.nif;
  }
};

const nuevoProv = () => {
  formRef.value.resetFields();
  formState.codigo = 'NUEVO';
  disabledCpos.value = false;
  nextTick(
    () => nomProv.value.focus() //foco al código de pro
  );
};

const onOk = async () => {
  // Al pulsar el botón de Aceptar del Modal
  if (!formState.codigo || !formState.nombre || !formState.nif) {
    return message.error('Datos del proveedor incompletos', 1.5);
  }
  st.dt.codProv = formState.codigo;
  st.dt.nomProv = formState.nombre;
  st.dt.nifProv = formState.nif;
  //Comprobamos si existe el proveedor en la sociedad del elemento de imputación
  const url = 'Busquedas_JSONP.asp';
  const payload = { provsoc: st.dt.codProv + ';' + st.dt.sociedad.substr(0, 4) };
  try {
    const data = await httpJSONP(url, payload);
    st.dt.viaPago = '';
    st.dt.condPago = '';
    st.dt.mismaSocProv = data.existe;
    if (data.existe) {
      //Existe el proveedor en la sociedad, obtenemos la via y condición de pago
      st.dt.viaPago = data.via;
      st.dt.condPago = data.condicion;
      //mba-09/12/2024 Comprobamos que no esté bloqueado, si lo está no permitirá seleccionarlo
      if (data.bloqueado) {
        return message.error('El proveedor está bloqueado, conctacte con el Dpto de Compras', 2);
      }
    }
    modalOpen.value = false; //Cerramos el modal
  } catch (error) {
    return console.error(error);
  } finally {
    loading.value = false;
  }
};

const checkNif = async () => {
  // Comprobamos si el nif introducido existe en SAP. De ser así cargará
  // La información del proveedor y volverá a inhabilitar los campos
  if (formState.nif) {
    formState.nif = formState.nif.toUpperCase().trim();
    const url = 'Busquedas_JSONP.asp';
    const payload = { proveedor: 'F' + formState.nif };
    loading.value = true;
    try {
      const data = await httpJSONP(url, payload);
      if (data.length === 1) {
        formState.codigo = data[0].codigo;
        formState.nombre = data[0].nombre;
        formState.nif = data[0].nif;
        disabledCpos.value = true;
        return message.success('El proveedor ya existe en SAP. Se ha rellenado automáticamente', 2);
      }
      // // Validación del NIF (Tanto nif como dni )
      // if (!validarNif(formState.nif) && !validarDNI(formState.nif)) {
      //   message.warning('NIF no válido', 1.3);
      //   formState.nif = '';
      //   return;
      // }
    } catch (error) {
      return console.log(error);
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style>
.margen-negativo {
  margin-top: -55px;
}
</style>
