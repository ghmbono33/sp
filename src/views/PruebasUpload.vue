<template>
  <a-button type="primary" @click="showModal">Subir ficheros</a-button>

  <a-modal
    v-model:visible="modalOpen"
    class="dark-modal"
    width="900px"
    ok-text="Aceptar"
    cancel-text="Cancelar"
    @ok="subirFicheros"
  >
    <template #title>
      <div class="dark-modal-title">
        <span>SUBIR FICHEROS</span>
      </div>
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
        <span class="formatos-permitidos">Sólo se admiten: PDF, Excel y Word.</span>
      </div>

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
            pageSize: 6,
          }"
        >
          <template #bodyCell="{ column, text, record }">
            <!-- Para que la columna id tenga un enlace y nos lleve a la SC -->
            <template v-if="column.dataIndex !== 'operation'">
              {{ text }}
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <!-- <div class="editable-row-operations"> -->
              <a-tooltip placement="bottomRight" title="Eliminar">
                <a-button shape="round" size="small" class="ant-outlined-danger ms-2" @click="remove(record.fichero)">
                  <template #icon>
                    <delete-outlined />
                  </template>
                </a-button>
              </a-tooltip>
              <!-- </div> -->
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </a-modal>
</template>

<!-- ---------------------------------- -->

<script setup>
import { onMounted, ref } from 'vue';
// lib para msgbox de ant design
import { CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
import { createVNode } from 'vue';

// Pinia
import { useStore } from '../stores/store.js';

const st = useStore();

// Modal
const modalOpen = ref(false);
const showModal = () => {
  modalOpen.value = true;
};

// Tabla
const columns = [
  {
    title: 'Fichero',
    dataIndex: 'fichero',
    width: '80%',
  },
  {
    width: '20%',
    title: '',
    dataIndex: 'operation',
  },
];

const ficherosTabla = ref([]);
const ficheros = [];

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
  for (let i = 0; i < files.length; i++) {
    // Tendremos en cuenta que solo se admiten Ficheros PDF, Excel y Word
    if (formatos.includes(files[i].type)) {
      // Comprobamos que no exista ya un fichero con ese nombre
      if (ficheros.filter((e) => e.name === files[i].name).length === 0) {
        // no existe ninguno con este nombre
        ficherosTabla.value.push({ fichero: files[i].name, operation: '' });
        ficheros.push(files[i]);
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

const salir = () => {
  modalOpen.value = false;
};

const subirFicheros = async () => {
  // Comprobamos que haya algún archivo
  if (ficheros.length === 0) return mensaje('No hay ningún fichero que subir');

  const respuesta = await pregunta(
    'Tras subir los ficheros no podrás agregar o eliminar ninguno más. \n ¿Subir ficheros? ',
    true
  );
  if (!respuesta) return;
  ficheros.forEach(async (fich) => {
    const listaFicheros = ficherosTabla.value.map((e) => e.fichero);
    //si no está incluido en la lista pq se ha borrado de la tabla saldremos
    if (!listaFicheros.includes(fich.name)) return;
    // Enviamos el archivo a través de un FormData
    const formData = new FormData();
    formData.append('file', fich);
    try {
      // Realizar la petición HTTP para subir los Ficheros al servidor
      // Nota: La petición la hago vía fetch ya que no es posible hacerlo con JSONP
      // porque no éste no admite el método POST. Por lo tanto  las pruebas
      // no las puedo hacer desde localhost
      await fetch('asp/upload.asp', {
        method: 'POST',
        body: formData,
      });
      // Todo ok
    } catch (error) {
      mensaje('Ha habido algún problema y no se han podido subir todos los ficheros');
    }
  });
};

const remove = (fichero) => {
  // Eliminamos el elemento actual, preguntamos antes

  Modal.confirm({
    title: '¿Estás seguro de eliminar esta entrada?',
    icon: createVNode(CloseCircleOutlined),
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
  /* margin: 5px; */
  display: flex;
  /* justify-content: center; */
  gap: 15px;
}

.drop-zone {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  font-size: 18px;
  min-width: 420px;
}

.drop-zone.highlight {
  /* background-color: #f2f2f2; */
  background-color: lightgray;
}
.tabla-ficheros {
  min-width: 420px;
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
