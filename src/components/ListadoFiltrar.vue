<template>
  <div class="componente-inline-listado">
    <a-form-item name="numSolicitud" label="Nº Solicitud">
      <a-input type="number" style="width: 90px" v-model:value="st.dt.numSolicitud" />
    </a-form-item>

    <a-form-item name="fecDesde" label="F. Desde">
      <a-input type="date" style="width: 130px" v-model:value="st.dt.fecDesde" />
    </a-form-item>

    <a-form-item name="fecHasta" label="F. Hasta">
      <a-input type="date" style="width: 130px" v-model:value="st.dt.fecHasta" />
    </a-form-item>

    <a-form-item name="estado" label="Estado">
      <a-select
        v-model:value="st.dt.conPedido"
        :options="optConPedido"
        placeholder="Estado del Pedido"
        style="width: 150px"
      ></a-select>
    </a-form-item>

    <!-- Botón para eliminar los filtros -->
    <a-button
      @click="limpiarFiltroBusqueda"
      title="Eliminar Filtro Búsqueda"
      class="btn-clean"
      type="primary"
      size="normal"
      shape="round"
    >
      &nbsp;&nbsp;&nbsp;
      <template #icon>
        <DeleteFilled style="position: relative; top: -2px" />
      </template>
    </a-button>

    <!-- Botón de búsqueda para recargar la tabla/rejilla -->
    <a-button
      @click="st.getSolicitudes(st.dt.numSolicitud)"
      class="btn-getdata"
      type="primary"
      size="large"
      shape="round"
    >
      &nbsp;&nbsp;&nbsp; Buscar
      <template #icon>
        <FileSearchOutlined style="position: relative; top: -2px" />
      </template>
    </a-button>
    <Loader :loading="st.loading" style="margin-left: 30px" />
  </div>

  <!-- En otra línea mostraremos los colaboradores (si tiene) y cebes asignados (si) -->

  <br />
  <div class="componente-inline-listado">
    <!-- En caso de que sea responsable mostrará sus colaboradores -->
    <a-form-item v-if="optColaborador.length > 0" name="colaborador" label="Solicitante">
      <a-select
        v-model:value="st.dt.colaborador"
        :options="optColaborador"
        placeholder="Colaborador"
        style="width: 260px"
      ></a-select>
    </a-form-item>

    <!-- En caso de que tenga algún cebe (ceco o Pep) asignado en ZTCO002  -->
    <a-form-item v-if="optCebe.length > 0" name="cebe" label="Responsable Centro">
      <a-select v-model:value="st.dt.cebe" :options="optCebe" style="width: 300px"></a-select>
    </a-form-item>
  </div>
</template>

<!-- ------------------------------------------------------------------- -->
<script setup>
import { DeleteFilled, FileSearchOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
import { onMounted, ref } from 'vue';
// Pinia
import { useStore } from '../stores/store.js';
import { httpJSONP } from '../helpers/http';
const st = useStore();
const optColaborador = ref([]);
const optCebe = ref([]);
const optConPedido = [
  { label: 'Con Pedido', value: 'S' },
  { label: 'Sin Pedido', value: 'N' },
  { label: 'Todos', value: '' },
];
onMounted(async () => {
  // volver a dejar el filtro que había y además actualiza la tabla si ha habido cambios
  st.reestablecerFiltroTabla();
  //obtiene el array de colaboradores, si no es responsable el array estará vacío
  getColaboradores();
  //obtiene el array de centros de los que es responsable (p.ej:Jefes de Obra), si no tiene estará vacío
  getCebesRespon();
});

const getCebesRespon = async () => {
  const payload = { numcontrol: st.numcontrol };
  optCebe.value = await httpJSONP('cebesRespon_jsonp.asp', payload);
  if (optCebe.value.length > 0) {
    // Tiene asignado algún cebe (ceco o pep) en la ZTCO002, se muestra solo los que tienen solicitudes
    // Este filtro se muestra solo a los JO u otros reponsables de centros
    // añadimos TODOS al principio para que pueda seleccionarlos todos
    //el valor de todos contiene los nombres de usuario separados por comas, ejem: '0075120/U0','0075121/00'
    const todos = optCebe.value.map((e) => e.value).join(',');
    optCebe.value.unshift({ label: 'TODOS', value: todos });
  }
};
const getColaboradores = async () => {
  const payload = { numcontrol: st.numcontrol };
  optColaborador.value = await httpJSONP('colaboradores_jsonp.asp', payload);
  if (optColaborador.value.length > 0) {
    // Tiene colaboradores, se muestran solo aquellos colaboradores que tienen solicitudes,
    // añadimos TODOS al principio para que pueda seleccionarlos todos
    //el valor de todos contiene los nombres de usuario separados por comas, ejem: 'MBONO','EALBERT'
    const todos = optColaborador.value.map((e) => e.value).join(',');
    optColaborador.value.unshift({ label: 'TODOS', value: todos });
    // mba-30/01/2024 comento lo de añadir la columna solicitante porque ahora se mostrará siempre
    // Añadimos la columna solicitante en el listado, justo al principio, sólo si no se ha añadido anteriormente
    // Utiliza el método some() para saber si existe
    // if (!st.colSolicitudes.some((e) => e.dataIndex === 'solicitante')) {
    //   // no existe, la añadimos
    //   const colSolicitante = {
    //     title: 'Solicitante',
    //     dataIndex: 'solicitante',
    //     width: '5%',
    //   };
    //   st.colSolicitudes.unshift(colSolicitante);
    // }
  }
};

const limpiarFiltroBusqueda = () => {
  Modal.confirm({
    title: '¿Eliminar filtro de búsqueda?',
    okText: 'Sí',
    okType: 'danger',
    cancelText: 'No',
    onOk: () => {
      // deshacemos los cambios
      // Reset de todos los datos que hay en dt (en estos están los campos del filtro)
      st.resetData();
    },
    onCancel: () => {},
  });
};
</script>
<!-- ------------------------------------------------------------------- -->
<style scoped>
.btn-getdata {
  width: 160px;
  margin-left: 85px;
  margin-top: -7px;
}
.btn-clean {
  width: 60px;
  margin-left: 20px;
  background-color: rgb(222, 87, 38) !important;
  border-color: red !important;
}
.btn-getdata svg {
  margin-top: -12px;
}
</style>
