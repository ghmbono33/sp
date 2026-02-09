<template>
  <div>
    <div id="tabla">
      <a-table
        :pagination="false"
        :sticky="true"
        size="small"
        :columns="visibleColumns"
        :data-source="st.dt.detalle"
        :row-key="(record) => record.id"
        :locale="st.localeConfig"
        bordered
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="['cantidad', 'precio', 'descripcion'].includes(column.dataIndex)">
            <div>
              <!-- el campo descripción es textarea, el resto son inputs -->
              <!-- En la descripción solo permito un máximo de 60 posiciones por fila, gracias a cols="60"
              lo hago así para que sea el propio textarea quien gestione el cambio de fila. Inicialmente el 
              tamaño era de 72 caracteres por fila (que es lo que el popup de sap tiene) pero finalmente 
              se deja en 60 ya que el texto se copia al pedido y en éste el ancho es de 60 de lo contrario
              en el pedido habrían líneas cortadas. -->
              <textarea
                ref="txtArea"
                v-if="column.dataIndex === 'descripcion' && editableData[record.key]"
                @change="hayCambios = true"
                :rows="3"
                :cols="60"
                :maxlength="1500"
                v-model="editableData[record.key][column.dataIndex]"
                style="margin: -5px 0; resize: none"
              />
              <a-input
                @change="hayCambios = true"
                @keydown.enter.prevent
                v-if="column.dataIndex !== 'descripcion' && editableData[record.key]"
                :type="column.type"
                v-model:value="editableData[record.key][column.dataIndex]"
                style="margin: -5px 0"
              />
              <template v-if="!editableData[record.key]">
                {{ text }}
              </template>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <span v-if="editableData[record.key]">
                <a-tooltip placement="bottomRight" title="Guardar">
                  <a-button
                    type="default"
                    size="small"
                    shape="round"
                    @click="save(record.key)"
                    class="ant-outlined-primary me-2"
                  >
                    <template #icon>
                      <save-outlined />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip placement="bottomRight" title="Cancelar">
                  <a-button shape="round" size="small" @click="cancel(record.key)" class="ant-outlined-warning">
                    <template #icon>
                      <close-circle-outlined />
                    </template>
                  </a-button>
                </a-tooltip>
              </span>
              <span v-else>
                <a-tooltip placement="bottomRight" title="Editar">
                  <a-button shape="round" size="small" class="ant-outlined-secondary" @click="edit(record.key)">
                    <template #icon>
                      <edit-outlined />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip placement="bottomRight" title="Eliminar">
                  <a-button shape="round" size="small" class="ant-outlined-danger ms-2" @click="remove(record.key)">
                    <template #icon>
                      <delete-outlined />
                    </template>
                  </a-button>
                </a-tooltip>
              </span>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <p style="margin-top: 7px; margin-left: 860px; color: red; font-weight: bold; letter-spacing: 0.15em">
      TOTAL PEDIDO: &nbsp;{{ formatearNumero(totalTabla) }} € &nbsp;&nbsp;&nbsp;
      <button @click="newRow" type="button" class="btn btn-sm btn-outline-success me-5">+ Nueva Entrada</button>
    </p>
  </div>
</template>

<!-- ---------------------------------------------------------------------- -->

<script setup>
import {
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';
import { computed, createVNode, reactive, ref } from 'vue';
import { formatearNumero, numDecimales } from '../helpers/numeros';

// Pinia
import { useStore } from '../stores/store.js';
const st = useStore();
const txtArea = ref('');
const columns = [
  {
    title: 'id',
    dataIndex: 'key',
    width: '0%',
  },
  {
    title: '* Cantidad',
    dataIndex: 'cantidad',
    width: '10%',
    type: 'number',
    maxWidth: 6,
  },
  {
    title: '* Descripción',
    dataIndex: 'descripcion',
    width: '54%',
    type: 'text',
    maxWidth: 40,
  },
  {
    title: 'Precio',
    dataIndex: 'precio',
    width: '10%',
    type: 'number',
    maxWidth: 6,
  },
  {
    title: 'Total' /* Campo calculado */,
    width: '15%',
    key: 'total',
    customRender: ({ record }) => {
      return formatearNumero(record.cantidad * record.precio);
    },
  },
  {
    width: '11%',
    title: '',
    dataIndex: 'operation',
  },
];

// Mostramos todas las columnas menos la del id
const visibleColumns = computed(() => columns.filter((e) => e.dataIndex !== 'key'));

const data = [];

st.dt.detalle = ref(data);
const editableData = reactive({});

let hayCambios = false;

// Calculo del sumatorio de cantidad * precio de todas las líneas
// reduce: primer parámetro = acumulador, segundo parámetro = valor actual, el 0 del final es el valor inicial
// const totalTabla = computed(() => st.dt.detalle.reduce((total, e) => total + e.cantidad * e.precio, 0));
const totalTabla = computed(() => st.total());

const scrollDown = () => {
  // nos vamos al final de la tabla
  const tabla = document.getElementById('tabla');
  tabla.scrollTop = tabla.scrollHeight;
};

const eliminarUltimaFila = (key) => {
  //Comprobamos si la ultima fila está vacía y si es así la eliminamos
  if (st.ultimaFilaVacia()) {
    st.dt.detalle = st.dt.detalle.filter((e) => e.key !== key);
  }
};

const newRow = () => {
  // creamos una nueva entrada
  if (st.ultimaFilaVacia()) {
    // Si se quiere crear una entrada cuando la última todavía no está guardada
    return Modal.error({
      title: 'Ya existe una entrada pendiente de guardar',
      // content: 'some messages...some messages...',
      okText: 'Aceptar',
    });
  }
  // Obtenemos el último id y le sumamos 10 (en sap van de 10 en 10: 10, 20, 30,...)
  let key = 10;
  if (st.dt.detalle.length > 0) {
    key = Math.max(...st.dt.detalle.map((e) => e.key)) + 10;
  }
  st.dt.detalle.push({ key, cantidad: 0, precio: 0 });
  setTimeout(() => scrollDown(), 20);
  edit(key);
};

const edit = (key) => {
  hayCambios = false;
  editableData[key] = cloneDeep(st.dt.detalle.filter((item) => key === item.key)[0]);
};

const remove = (key) => {
  hayCambios = false;
  // Eliminamos el elemento actual, preguntamos aantes
  Modal.confirm({
    title: '¿Estás seguro de eliminar esta entrada?',
    // content: "Some descriptions",
    okText: 'Sí',
    okType: 'danger',
    cancelText: 'No',
    onOk: () => {
      // Eliminamos la entrada
      hayCambios = false;
      st.dt.detalle = st.dt.detalle.filter((e) => e.key !== key);
    },
    onCancel: () => {
      // no hacemos nada
    },
  });
};

const save = (key) => {
  // Comprobamos que al menos se haya completado la cantidad y descripción, el precio es opcional
  const { cantidad, descripcion, precio } = editableData[key];
  if (cantidad <= 0) return message.error('La cantidad debe ser mayor a 0', 1.5);
  if (cantidad > 999999999.999) return message.error('La cantidad no puede ser superior a 999.999.999,999', 1.5);
  if (precio < 0) return message.error('El precio no puede ser negativo', 1.5);
  if (precio > 999999999.999) return message.error('El precio no puede ser superior a 999.999.999,999', 1.5);
  // Comprobamos la parte decimal la cantidad admite hasta 3 y el precio hasta 2
  if (numDecimales(cantidad) > 3) {
    return message.error('La cantidad admite un máximo de 3 decimales', 1.5);
  }
  if (numDecimales(precio) > 3) {
    return message.error('El precio admite un máximo de 3 decimales', 1.5);
  }
  if (descripcion.trim() === '') return message.error('Falta indicar la Descripción', 1.5);

  editableData[key].precio = editableData[key].precio || 0; //si no hay precio dejamos el 0
  st.dt.detalle = st.dt.detalle.map((e) => (key === e.key ? editableData[key] : e));
  hayCambios = false;
  delete editableData[key];
};

const cancel = (key) => {
  if (!hayCambios) {
    // Si la última fila está vacía la eliminaremos
    eliminarUltimaFila(key);
    delete editableData[key];
    return;
  }
  Modal.confirm({
    title: '¿Cancelar los cambios?',
    icon: createVNode(ExclamationCircleOutlined),
    // content: "Some descriptions",
    okText: 'Sí',
    okType: 'danger',
    cancelText: 'No',
    onOk: () => {
      // deshacemos los cambios
      hayCambios = false;
      delete editableData[key];
      // No haremos nada a menos que la fila no tenga información en cuyo caso la eliminaremos
      eliminarUltimaFila(key);
    },
    onCancel: () => {
      // No haremos nada
    },
  });
};

const descripcion72 = (descrip, key) => {
  // Como la descripción se termina guardando en la tabla ZTMM047 que es una tabla de las que
  // permiten introducir notas en SAP y cada una de sus líneas debe de ser de 72 posiciones,
  // la función se encarga de  saltar de línea cada 72 caracteres.
  return;
  // const lines = descrip.split('\n');
  // for (let i = 0; i < lines.length; i++) {
  //   if (lines[i].length > 72) {
  //     let modifiedLine = '';

  //     while (lines[i].length > 72) {
  //       modifiedLine += lines[i].substring(0, 72) + '\n';
  //       lines[i] = lines[i].substring(72);
  //     }

  //     modifiedLine += lines[i];
  //     lines[i] = modifiedLine;
  //   }
  // }
  // // Actualizamos V-MODEL DEL CAMPO de esta forma automáticamente
  // // se actualiza en pantalla
  // editableData[key]['descripcion'] = lines.join('\n');
};
</script>

<!-- ---------------------------------------------- -->
<style scoped>
/* Tabla ant design */
#tabla {
  height: 250px;
  width: 1240px;
  overflow-y: scroll;
  border: 1px solid #999;
}
.editable-row-operations a {
  margin-right: 8px;
}

td.ant-table-cell {
  padding: 4px !important;
}

/* Quito las flechas de subir y bajar en los números */
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}
</style>
