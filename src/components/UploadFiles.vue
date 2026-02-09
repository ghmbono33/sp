<template>
  <a-button
    type="primary"
    @click="showModal"
    class="enabled ant-outlined-primary"
    shape="round"
    :size="large"
    style="padding: 7px 26px 33px"
  >
    Subir Ficheros
    <template #icon>
      <file-add-outlined style="font-size: 24px" />
    </template>
  </a-button>

  <a-modal
    id="modal-ficheros"
    style="min-width: 900px"
    v-model:visible="modalOpen"
    class="dark-modal"
    ok-text="Aceptar"
    cancel-text="Cancelar"
    @ok="subirFicheros"
    :maskClosable="false"
  >
    <template #title>
      <div class="dark-modal-title">
        <span>SUBIR FICHEROS</span>
      </div>
    </template>
    <!-- Personalizamos el footer -->
    <template #footer>
      <a-button key="back" @click="modalOpen = false">Cancelar</a-button>
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
                  <a-button shape="round" size="small" class="ant-outlined-danger ms-2" @click="remove(record.fichero)">
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
</template>

<!-- ---------------------------------- -->

<script setup>
import { computed, ref, nextTick } from 'vue';
// lib para msgbox de ant design
import { DeleteOutlined, FileAddOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
import { esLocal } from '../helpers/varios';
import { httpJSONP } from '../helpers/http';

// Pinia
import { useStore } from '../stores/store.js';
const st = useStore();
const hayFicheros = computed(() => !!st.dt.ficheros); //doble negación para convertir en booleano
// Modal
const modalOpen = ref(false);

// Tabla
let columns = ref([]);
let colYaSubidos = ref([]);

const ficherosTabla = ref([]);
const ficherosYaSubidos = ref([]);
const archivos = [];

// Zona de drag & drop
const entering = ref(false);

// funciones
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
      true
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

const pregunta = (title) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      // icon: createVNode(ExclamationCircleOutlined),
      // content: "Some descriptions",
      okText: 'Aceptar',
      okCancel: 'Cancelar',
      // okType: 'danger',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};

const showModal = () => {
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
  st.dt.ficheros
    .split('|')
    .forEach((nombreFich) => ficherosYaSubidos.value.push({ fichero: nombreFich, operation: '' }));

  archivos.length = 0; //inicializamos el array de archivos a subir
  // Mostramos el modal
  modalOpen.value = true;
  // Como no he conseguido a través de css establecer el alto del  cuerpo del modal lo hago con JS
  // nextTick(() => (document.querySelector('.ant-modal-body').style.height = '600px'));
};

const subirFicheros = async () => {
  // Comprobamos que haya algún archivo
  if (archivos.length === 0) return mensaje('No hay ningún fichero que subir');

  // const respuesta = await pregunta(
  //   'Tras subir los ficheros no podrás eliminar ninguno más. ¿Subir ficheros? ',
  //   true
  // );
  // if (!respuesta) return;

  // const habianFicheros = hayFicheros;
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
      const url = `asp/upload.asp?numsolcom=${st.dt.id}&nomFichero=${fich.name}`;
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

  if (ficherosTabla.value.length > 0 && ficherosYaSubidos.value.length > 0) {
    //Se han subido nuevos archivos cuando ya se habían subido con anterioridad.
    //Normalmente se debe a que el técnico de compras desde la transacción de SC en SAP le rechaza la solicitud por falta de
    //documentación y es ahora cuando la añade. Para que el técnico de compras sepa que se ha añadido nueva documentación se
    //le envía un mail avisándole
    await httpJSONP('mailFicheros.asp', { id: st.dt.id });
  }
  modalOpen.value = false; //cerramos el modal
};

const remove = (fichero) => {
  // Eliminamos el elemento actual, preguntamos antes

  Modal.confirm({
    title: '¿Estás seguro de eliminar esta entrada?',
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
</script>

<!-- ---------------------------------- -->

<style scoped>
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
