<template>
  <div :class="{ disabled: st.dt.id !== '0' }">
    <!-- No se puede editar, así que si entrar en una solicitud ya existente todos los campos están inhabilitados -->
    <a-form
      :nativeEnterKey="false"
      layout="horizontal"
      :model="st.dt"
      :validate-messages="validateMessages"
      name="principal"
      @finish="validaciones"
      @finishFailed="formIncompleto"
    >
      <div class="componente-inline">
        <a-form-item
          name="tipoSolicitud"
          label="Tipo Solicitud"
          :rules="[{ required: true, message: 'Campo obligatorio' }]"
        >
          <a-select
            v-model:value="st.dt.tipoSolicitud"
            :options="st.opcTipoSolicitud"
            :disabled="inhabilitarTipoSolicitud"
            placeholder="Selecciona opción"
            style="width: 230px"
            @change="avisoTipoSolicitud"
          >
          </a-select>
        </a-form-item>
        <a-form-item label="F. Solicitud" class="ms-3">
          <a-input type="date" disabled style="width: 120px" v-model:value="st.dt.fecSolicitud" />
        </a-form-item>
        <a-form-item label="Nº Solicitud">
          <a-input disabled style="width: 75px" v-model:value="st.dt.id" />
        </a-form-item>
      </div>
      <br />
      <!-- Los divs son necesarios para crear el salto de línea, de lo contrario si se cambiara la resolución saldrían juntos -->
      <template v-if="st.dt.tipoSolicitud !== ''">
        <div>
          <ImportePedido />
        </div>
        <div v-if="st.dt.tipoSolicitud !== '3'">
          <ImputacionSociedad />
        </div>
        <div v-if="st.dt.tipoSolicitud !== '3'">
          <ProveedorCompras />
        </div>
        <div class="contenedor-flex">
          <CuentaBancaria />
        </div>
        <div>
          <Observaciones />
        </div>
        <LogErrores v-if="mostarErrores" @ocultarLogErrores="ocultarLogErrores" :errores="errValidacion"></LogErrores>
      </template>

      <!-- S U B I R    F I C H E R O S -->
      <div class="center">
        <a-button
          v-if="st.dt.id !== '0'"
          type="primary"
          @click="showModalFicheros"
          class="enabled ant-outlined-primary"
          shape="round"
          :size="large"
          style="padding: 7px 26px 33px; margin-right: 120px"
        >
          Subir Ficheros
          <template #icon>
            <file-add-outlined style="font-size: 24px" />
          </template>
        </a-button>

        <a-modal
          id="modal-ficheros"
          style="min-width: 900px"
          v-model:visible="modalFicherosOpen"
          class="dark-modal"
          ok-text="Aceptar"
          cancel-text="Cancelar"
          @ok="subirFicheros"
          :maskClosable="false"
          :closable="false"
        >
          <template #title>
            <div class="dark-modal-title">
              <span>SUBIR FICHEROS</span>
            </div>
          </template>
          <!-- Personalizamos el footer -->
          <template #footer>
            <a-button key="back" @click="cerrarDialogoFicheros">Cancelar</a-button>
            <a-button key="submit" type="primary" @click="subirFicheros">Aceptar</a-button>
          </template>

          <div class="upload">
            <div
              id="drop-zone"
              :class="['drop-zone', entering ? 'highlight' : '']"
              @drop="handleDrop($event)"
              @dragover.prevent="entering = true"
              @dragleave="entering = false"
              @dragenter.prevent
            >
              Haz click en el icono
              <label>
                <img src="../assets/upload.png" alt="Subir Ficheros" height="40px" />
                <input id="file-input" type="file" multiple @change="handleFileInput($event)" />
              </label>
              <br />
              o arrastra los ficheros a este recuadro <br />
              <span class="formatos-permitidos"
                >Sólo se admiten: PDF, Excel y Word. <br />
                Tamaño máximo de 30Mb por fichero</span
              >
            </div>
            <div class="tbs-ficheros">
              <div class="tabla-ficheros">
                <a-table
                  bordered
                  :data-source="ficherosTabla"
                  :columns="columns"
                  :sticky="true"
                  size="small"
                  :row-key="(record) => record.fichero"
                  :locale="st.localeConfig"
                  :pagination="{
                    showSizeChanger: false,
                    pageSize: 4,
                  }"
                >
                  <template #bodyCell="{ column, text, record }">
                    <template v-if="column.dataIndex !== 'operation'">
                      {{ text }}
                    </template>
                    <template v-if="column.dataIndex === 'operation'">
                      <a-tooltip placement="bottomRight" title="Eliminar">
                        <a-button
                          shape="round"
                          size="small"
                          class="ant-outlined-danger ms-2"
                          @click="remove(record.fichero)"
                        >
                          <template #icon>
                            <delete-outlined />
                          </template>
                        </a-button>
                      </a-tooltip>
                    </template>
                  </template>
                </a-table>
              </div>
              <div v-if="hayFicheros" class="tabla-ficheros-yasubidos">
                <a-table
                  bordered
                  :data-source="ficherosYaSubidos"
                  :columns="colYaSubidos"
                  :sticky="true"
                  size="small"
                  :row-key="(record) => record.fichero"
                  :locale="st.localeConfig"
                  :pagination="{
                    showSizeChanger: false,
                    pageSize: 4,
                  }"
                >
                  <template #bodyCell="{ column, text, record }">
                    <template v-if="column.dataIndex !== 'operation'">
                      {{ text }}
                    </template>
                  </template>
                </a-table>
              </div>
            </div>
          </div>
        </a-modal>

        <!-- G U A R D A R -->
        <a-button
          v-if="st.dt.tipoSolicitud !== ''"
          size="large"
          type="primary"
          html-type="submit"
          shape="round"
          class="ant-outlined-success"
          :disabled="st.dt.guardando || cambiosGuardados"
        >
          <template #icon>
            <SaveOutlined style="position: relative; top: -2px" />
          </template>
          Guardar
        </a-button>
        <!-- S A L I R -->
        <a-button size="large" @click="atras" type="primary" shape="round" class="enabled ant-outlined-secondary ms-5">
          <template #icon>
            <RollbackOutlined style="position: relative; top: -2px" />
          </template>
          Salir
        </a-button>

        <!-- A P R O B A R -->
        <!-- Se muestra solo si está pendiente de autorizar/aprobar y el usuario es el director de compras o director del negocio -->
        <a-button
          v-if="st.dt.aprobarSolicitud === 'X'"
          size="large"
          @click="aprobar"
          type="primary"
          class="enabled ant-success ms-5"
        >
          <template #icon>
            <CheckOutlined style="position: relative; top: -2px" />
          </template>
          Aprobar
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup>
// lib para msgbox de ant design
import { DeleteOutlined, FileAddOutlined, RollbackOutlined, SaveOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { esLocal } from '../helpers/varios.js';
import { httpJSONP } from '../helpers/http.js';
import { message, Modal } from 'ant-design-vue';
import { onMounted, computed, ref, createVNode, watch } from 'vue';

import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
//Pinia
import { useStore } from '../stores/store';
const st = useStore();
const mostarErrores = ref(false);
let errValidacion = [];
const route = useRoute();
const { id } = route.params; //obtenemos el id de la SC que viene como parámetro en la ruta
const inhabilitarTipoSolicitud = ref(false);

// -------------------

const router = useRouter();

const cambiosGuardados = computed(() => JSON.stringify(st.dt) === JSON.stringify(st.dtInicial));
const hayFicheros = computed(() => !!st.dt.ficheros); //doble negación para convertir en booleano

// Modal Subir archivos
const modalFicherosOpen = ref(false);

// Tabla archivos
let columns = ref([]);
let colYaSubidos = ref([]);

const ficherosTabla = ref([]);
const ficherosYaSubidos = ref([]);
const archivos = [];

// Zona de drag & drop
const entering = ref(false);

// funciones

const atras = () => {
  // vamos a la página anterior (el listado de solicitudes)
  // history.go(-1);
  router.replace('/');
};

const aprobar = () => {
  // aprobar la solicitud

  Modal.confirm({
    title: '¿Aprobar solicitud?',
    // content: "Some descriptions",
    okText: 'Sí',
    okType: 'primary',
    cancelText: 'No',
    onOk: async () => {
      await st.aprobarSolicitud(); //Guardamos en BBDD
      router.replace('/'); //Volvemos al listado de solicitudes
    },
    onCancel: () => {
      // no hacemos nada
    },
  });
};

const cerrarDialogoFicheros = () => {
  debugger;

  if (ficherosYaSubidos.value.length === 0 && st.dt.tipoSolicitud !== '3') {
    mensaje('¡Debe seleccionar algún fichero a subir!', true);
    return;
  }

  modalFicherosOpen.value = false;
};

const handleFileInput = (event) => selectFiles(event.target.files);

const handleDrop = (event) => {
  event.preventDefault();
  document.getElementById('drop-zone').classList.remove('highlight');
  selectFiles(event.dataTransfer.files);
};

const selectFiles = (files) => {
  // recorremos los ficheros seleccionados y solo tenemos en cuenta los pdf,word,excel
  const formatos = [
    'application/vnd.ms-excel',
    'application/msword',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  // nos quedamos con los válidos
  let formatoErroneo = false;
  let ficheroRepetido = false;
  let excedeTamanyo = false;
  // ficherosTabla.value.length = 0; //vacío el array
  for (let i = 0; i < files.length; i++) {
    // Tendremos en cuenta que solo se admiten Ficheros PDF, Excel y Word
    if (formatos.includes(files[i].type)) {
      if (files[i].size > 1024 * 1024 * 30) {
        //Mayor de 30Mb no lo tenemos en cuenta
        excedeTamanyo = true;
        continue;
      }
      // Comprobamos que no exista ya un fichero con ese nombre
      if (archivos.filter((e) => e.name === files[i].name).length === 0) {
        // no existe ninguno con este nombre
        ficherosTabla.value.push({ fichero: files[i].name, operation: '' });
        archivos.push(files[i]);
      } else {
        // Ya existe alguno con ese nombre
        ficheroRepetido = true;
      }
    } else {
      formatoErroneo = true;
    }
  }

  if (formatoErroneo) {
    mensaje('Se han descartado los ficheros que no son: PDF, Excel, Word.');
  }
  if (excedeTamanyo) {
    mensaje('Se han descartado los ficheros con más de 30 Mb.');
  }
  if (ficheroRepetido) {
    mensaje(
      'Se ha seleccionado algún fichero ya incluido previamente. No puede haber más de un archivo con el mismo nombre',
      true,
    );
  }
};

const mensaje = (title, error = false) => {
  const data = {
    title,
    okText: 'Aceptar',
  };
  error ? Modal.error(data) : Modal.info(data);
};

const showModalFicheros = () => {
  debugger;
  if (+st.dt.id === 0) {
    mensaje('¡Antes de subir ficheros debes de guardar la solicitud!', true);
    return;
  }

  // Estructura columnas del grid de los FICHEROS A SUBIR
  columns.value = [
    {
      title: 'Ficheros a subir',
      dataIndex: 'fichero',
      width: '80%',
    },
    {
      width: '20%',
      title: '',
      dataIndex: 'operation',
    },
  ];

  // Estructura columnas del grid de los FICHEROS YA SUBIDOS
  colYaSubidos.value = [
    {
      title: 'Ficheros ya subidos',
      dataIndex: 'fichero',
      width: '100%',
    },
  ];
  ficherosYaSubidos.value.length = 0; //vacío el array
  ficherosTabla.value.length = 0; //vacío el array
  debugger;
  st.dt.ficheros
    .split('|')
    .filter((nombreFich) => nombreFich.trim() !== '')
    .forEach((nombreFich) => {
      ficherosYaSubidos.value.push({ fichero: nombreFich, operation: '' });
    });

  archivos.length = 0; //inicializamos el array de archivos a subir
  // Mostramos el modal
  modalFicherosOpen.value = true;
  // Como no he conseguido a través de css establecer el alto del  cuerpo del modal lo hago con JS
  // nextTick(() => (document.querySelector('.ant-modal-body').style.height = '600px'));
};

const subirFicheros = async () => {
  // Comprobamos que haya algún archivo
  if (archivos.length === 0) return mensaje('No hay ningún fichero que subir');

  if (esLocal()) alert('Estamos en desarrollo. No funciona la subida de archivos');
  // let indice = 0;
  if (hayFicheros) {
    st.dt.ficheros += '|'; //le añado el separador para seguir añadiendo ficheros
  }
  for (let i = 0; i < archivos.length; i++) {
    const fich = archivos[i];
    const listaFicheros = ficherosTabla.value.map((e) => e.fichero); //array con los ficheros que hay en la tabla
    //si no está incluido en la lista pq se ha borrado de la tabla pasaremos al siguiente elemento
    if (!listaFicheros.includes(fich.name)) continue;
    // Enviamos el archivo a través de un FormData
    const formData = new FormData();
    formData.append('file', fich);
    try {
      // Realizar la petición HTTP para subir los Ficheros al servidor
      // Nota: La petición la hago vía fetch ya que no es posible hacerlo con JSONP
      // porque  éste no admite el método POST. Por lo tanto  las pruebas
      // no las puedo hacer desde localhost
      const url = `asp/upload.asp?NUMSOLPAGO=${st.dt.id}&nomFichero=${fich.name}`;
      const res = await fetch(url, { method: 'POST', body: formData });
      // if (st.dt.ficheros.length > 0 && st.dt.ficheros.slice(-1) !== '|') {
      //   // Hay ficheros pero el último no lleva el separador "|" al final, esto es debido a que se quitó al guardarlo
      //   // la última vez, lo añadimos ahora ya que vamos a añadir nuevos ficheros
      // }
      st.dt.ficheros += fich.name + '|';
    } catch (error) {
      mensaje('Ha habido algún problema y no se han podido subir todos los ficheros');
      return;
    }
  }
  if (st.dt.ficheros) {
    st.dt.ficheros = st.dt.ficheros.slice(0, -1); //quitamos el último |
  }

  // !! MBA Creo que para SP no es necesario, lo dejo por si acaso
  // if (ficherosTabla.value.length > 0 && ficherosYaSubidos.value.length > 0) {
  //   //Se han subido nuevos archivos cuando ya se habían subido con anterioridad.
  //   //Normalmente se debe a que el técnico de compras desde la transacción de SC en SAP le rechaza la solicitud por falta de
  //   //documentación y es ahora cuando la añade. Para que el técnico de compras sepa que se ha añadido nueva documentación se
  //   //le envía un mail avisándole
  //   await httpJSONP('mailFicheros.asp', { id: st.dt.id });
  // }

  modalFicherosOpen.value = false; //cerramos el modal
};

const remove = (fichero) => {
  // Eliminamos el elemento actual, preguntamos antes

  Modal.confirm({
    title: '¿Seguro que deseas eliminar esta entrada?',
    // content: "Some descriptions",
    okText: 'Sí',
    okType: 'danger',
    cancelText: 'No',
    onOk: () => {
      // Eliminamos la entrada
      ficherosTabla.value = ficherosTabla.value.filter((e) => e.fichero !== fichero);
    },
    onCancel: () => {
      // no hacemos nada
    },
  });
};

// ---------------

onBeforeRouteLeave(async (to, from) => {
  // este guard se lanzará cuando salgamos de la página bien sea pulsando el botón atrás del navegador
  // o con el botón Salir del programa
  // para cancelar la acción de volver atrás tenemos que devolver false

  //Si no ha habido cambios continuaremos (vuelve en nuestro caso al listado de solicitudes)
  // No tenemos en cuenta lo que haya en ficheros ya que se añade después de guardar el registro
  // if (JSON.stringify(st.dt) === JSON.stringify(st.dtInicial)) return true;
  debugger;
  if (JSON.stringify({ ...st.dt, ficheros: undefined }) === JSON.stringify({ ...st.dtInicial, ficheros: undefined }))
    return true;

  //Ha habido cambios, creamos una promesa que devolverá true si queremos salir sin guardar o false
  //si continuamos en la página
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: 'Ha habido cambios. ¿Desea salir igualmente?',
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
});

onMounted(async () => {
  st.resetData(); //limpiamos los datos
  if (id !== '0') {
    inhabilitarTipoSolicitud.value = true; //si estamos editando una solicitud, no se podrá cambiar el tipo de solicitud
    try {
      await st.getSolicitud(id);
      // if (st.dt.numPedido) {
      //   Modal.info({
      //     title: 'Esta solicitud no se puede modificar porque tiene un pedido asignado',
      //     // content: 'some messages...some messages...',
      //     okText: 'Aceptar',
      //   });
      // }
    } catch (error) {
      console.log(error);
    } finally {
      //
    }
  }
});

const validateMessages = {
  required: 'Campo obligatorio',
  // types: {
  //   email: '${label} is not a valid email!',
  //   number: '${label} is not a valid number!',
  // },
  // number: {
  //   range: '${label} must be between ${min} and ${max}',
  // },
};

const avisoTipoSolicitud = () => {
  Modal.confirm({
    title: 'Una vez seleccionado el tipo de solicitud no podrá cambiarse.',
    content: '¿Continuar?',
    okText: 'Sí',
    cancelText: 'No',
    onOk: () => {
      inhabilitarTipoSolicitud.value = true;
    },
    onCancel: () => {
      st.dt.tipoSolicitud = '';
    },
  });
};

const ocultarLogErrores = () => {
  mostarErrores.value = false;
};

const validarIBAN = () => {
  // Si el IBAN es correcto devolverá una cadena vacía, si no devolverá el mensaje de error correspondiente
  if (st.dt.iban_pais === 'ES') {
    st.dt.iban = st.ibanCompleto();
    if (st.dt.iban.trim() === '') {
      return '';
    }
    if (!mod97(st.dt.iban)) return 'IBAN no válido';
  } else {
    st.dt.iban = st.dt.iban.replace(/\s+/g, '').toUpperCase();
    if (st.dt.iban.trim() === '') {
      return '';
    }
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(st.dt.iban)) {
      return 'Formato IBAN incorrecto';
    }
    if (!mod97(st.dt.iban)) return 'IBAN no válido';
  }
  return '';
};

function mod97(iban) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged
    .split('')
    .map((c) => (isNaN(c) ? c.charCodeAt(0) - 55 : c))
    .join('');
  return BigInt(numeric) % 97n === 1n;
}

const validaciones = async () => {
  // Las validaciones realizadas con rules en el formulario son correctas
  // Comprobamos otras validaciones
  errValidacion = [];

  // Empresa obligatoria
  if (st.dt.sociedad.trim() === '' && st.dt.tipoSolicitud !== '3') errValidacion.push('Falta indicar la sociedad');
  // Si el tipo de solicitud es "P=P"
  switch (st.dt.tipoSolicitud) {
    case '1': // Pago de Factura, es obligatorio el elemento de imputación a menos que sea inmovilizado
      if (st.dt.elementoImputacion.trim() === '' && !st.dt.inmovilizado)
        errValidacion.push('Falta indicar el elemento de imputación');
    case '2': // Pago anticipado a proveedores
      break;
    case '3': // Aportación UTES
      break;
    case '4': // Otros
      break;
  }

  //	Para tiposolicitud = 1 es oblgatorio el pedido si el importe es igual o superior a 3000€
  if (st.dt.tipoSolicitud === '1' && st.dt.importe >= 3000 && st.dt.numPedido.trim() === '') {
    errValidacion.push('Para importes iguales o superiores a 3.000€ debe de indicar el  Nº de Pedido.');
    st.dt.tipoImputacion = 'P';
  }

  //Si se ha seleccionado via pago = "O" (Transferencia electrónica) es necesario que se haya seleccionado una cuenta bancaria
  //El cálculo del IBAN se hace en validarIBAN, aunque no tenga via de pago transferencia electrónica, si se ha indicado el IBAN se validará igualmente
  const ibanError = validarIBAN();
  if (ibanError) errValidacion.push(ibanError);
  if (st.dt.viaPago === 'O' && st.dt.iban.trim() === '') {
    errValidacion.push('Para la vía de pago "Transferencia electrónica" debe indicar el IBAN');
  }

  //Mostramos el modal con los errores, es necesario ya que con el modal.error no funcionan los saltos de línea
  if (errValidacion.length > 0) {
    mostarErrores.value = true;
  } else {
    // Todo ok, guardamos los cambios
    //Es posible que el iban no exista en la lista de ibanes del proveedor, en tal caso se deberá adjuntar
    //documentación
    debugger;
    const ibanCompleto = st.ibanCompleto();
    const nuevoIban = ibanCompleto !== '' && !st.dt.bancos.includes(ibanCompleto);
    Modal.confirm({
      title: 'GUARDAR SOLICITUD DE PAGO',
      // content: h('div', {
      //   innerHTML: 'Una vez guardada la solicitud no se podrán modificar los datos. <br> ¿Desea continuar?',
      // }),
      // content: createVNode('div', null, [
      //   createVNode('div', null, 'Una vez guardada la solicitud no se podrán modificar los datos.'),
      //   createVNode('br', null, ''),
      //   st.dt.tipoSolicitud !== '3'
      //     ? (createVNode('div', null, 'Seguidamente deberá subir los archivos adjuntos correspondientes a:'),
      //       createVNode('br', null, ''),
      //       createVNode('div', null, ' ✔ Factura pdf'))
      //     : null,
      //   nuevoIban ? createVNode('div', null, ' ✔ Certificado de titularidad de la cuenta bancaria') : null,
      //   createVNode('br', null, ''),
      //   createVNode('b', null, '¿Desea continuar?'),
      // ]),
      content: createVNode('div', null, [
        createVNode('div', null, 'Una vez guardada la solicitud no se podrán modificar los datos.'),
        createVNode('br'),

        ...(st.dt.tipoSolicitud !== '3'
          ? [
              createVNode('div', null, 'Seguidamente deberá subir los archivos adjuntos correspondientes a:'),
              createVNode('br'),
              createVNode('div', null, '✔ Factura pdf'),
            ]
          : []),

        ...(nuevoIban ? [createVNode('div', null, '✔ Certificado de titularidad de la cuenta bancaria')] : []),

        createVNode('br'),
        createVNode('b', null, '¿Desea continuar?'),
      ]),
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        await st.guardar();
        if (st.dt.id !== '0') {
          showModalFicheros();
        }
      },
      onCancel: () => {},
    });
  }
};

const formIncompleto = (errors) => {
  if (errors) {
    console.log(errors);
    Modal.error({
      title: 'No es posible guardar la Solicitud de Pago',
      content: 'Faltan datos por completar.',
      okText: 'Aceptar',
    });
  }
};
</script>

<style>
.contenedor-flex {
  display: flex; /* Activamos flexbox */
  align-items: flex-start; /* Alineamos al inicio verticalmente */
  gap: 40px; /* Espacio opcional entre los componentes */
}
.center {
  display: inline-block;
  margin-left: 300px;
}

.upload {
  display: flex;
  gap: 15px;
}

.drop-zone {
  border: 2px dashed #ccc;
  padding: 120px 20px;
  text-align: center;
  font-size: 18px;
  min-width: 420px;
}

.drop-zone.highlight {
  background-color: lightgray;
}
/* .tabla-ficheros { */
[class^='tabla-ficheros'] {
  display: block;
  min-width: 420px;
  max-width: 600px;
}
.tbs-ficheros {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

#file-input {
  display: none;
}

img {
  height: 85px;
}
img:hover {
  cursor: pointer !important;
}
.formatos-permitidos {
  font-size: 12px;
  font-weight: bold;
}
</style>
