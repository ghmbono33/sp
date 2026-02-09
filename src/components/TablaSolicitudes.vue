<template>
  <!-- :columns="visibleColumns" -->
  <div id="tablaSolicitudes">
    <a-table
      bordered
      :data-source="st.dt.solicitudes"
      :columns="st.colSolicitudes"
      :sticky="true"
      size="small"
      :row-key="(record) => record.id"
      :locale="st.localeConfig"
      :pagination="{
        showSizeChanger: false,
        pageSize: 12,
      }"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex !== 'copiar' && column.dataIndex !== 'borrar'">
          <RouterLink :to="`/${record.id}`">
            {{ text }}
          </RouterLink>
        </template>
        <!-- Copiar Solicitud -->
        <template v-if="column.dataIndex === 'copiar'">
          <a-tooltip placement="bottomRight" :title="`Copiar Solicitud ${record.id}`">
            <a-button shape="round" size="small" class="ant-outlined-indigo ms-2" @click="copiar(record.id)">
              <template #icon>
                <copy-outlined />
              </template>
            </a-button>
          </a-tooltip>
        </template>
        <!-- Eliminar Solicitud, sólo se mostrará si no tiene pedido -->
        <template v-if="column.dataIndex === 'borrar' && record.numPedido === ''">
          <a-tooltip placement="bottomRight" :title="`Eliminar Solicitud ${record.id}`">
            <a-button shape="round" size="small" class="ant-outlined-danger ms-2" @click="borrar(record.id)">
              <template #icon>
                <delete-outlined />
              </template>
            </a-button>
          </a-tooltip>
        </template>
      </template>
    </a-table>
  </div>
</template>

<!-- ----------------------------------------------- -->
<script setup>
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
// Pinia
import { useStore } from '../stores/store.js';
import { useRouter } from 'vue-router';
import { httpJSONP } from '../helpers/http';
const router = useRouter();
const st = useStore();

const borrar = (id) => {
  Modal.confirm({
    title: `¿Eliminar la solicitud nº ${id}?`,
    content: 'Tras eliminarla no se podrá recuperar',
    okText: 'Sí',
    okType: 'danger',
    cancelText: 'No',
    onOk: async () => {
      const url = 'Delete_JSONP.asp';
      const payload = { id };
      try {
        // Eliminamos la solicitud
        await httpJSONP(url, payload);
        st.getSolicitudes(''); //actualizamos la tabla para que no se muestre la solicitud eliminada
        Modal.success({
          title: `Se ha eliminado la Solicitud nº ${id}`,
          okText: 'Aceptar',
        });
      } catch (error) {
        console.log(error.message);
        Modal.error({
          title: `Ha habido problemas al eliminar la solicitud. `,
          okText: 'Aceptar',
          // content: '',
        });
      }
    },
  });
};
const copiar = (id) => {
  Modal.confirm({
    title: `¿Crear una nueva solicitud como copia de la solicitud nº ${id}?`,
    okText: 'Sí',
    // okType: 'danger',
    cancelText: 'No',
    onOk: async () => {
      //TODO: Copiar
      const url = 'Duplicar_JSONP.asp';
      const payload = { id };
      try {
        // Duplicamos y abrimos la nueva solicitud
        const { nuevoId } = await httpJSONP(url, payload);

        Modal.success({
          title: `La Solicitud nº ${id} se ha copiado en la nueva solicitud nº ${nuevoId}. `,
          content: 'A continuación se abrirá la nueva solicitud',
          okText: 'Aceptar',
          onOk() {
            st.aux.idDestinoCopia = nuevoId; //indicamos el id destino de la copia, nos servirá después para el filtro en ListadoFiltrar
            router.push(`/${nuevoId}`);
          },
        });
      } catch (error) {
        console.log(error.message);
        Modal.error({
          title: `Ha habido problemas al copiar la solicitud. `,
          okText: 'Aceptar',
          // content: '',
        });
      }
    },
  });
};
</script>

<!-- ------------------------- -->

<style scoped>
/* Tabla ant design */
#tablaSolicitudes {
  /* width: 1450px; */
  width: 1650px;
  overflow-y: scroll;
  border: 1px solid #999;
}
</style>
