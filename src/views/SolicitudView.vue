<template>
  <!-- <div :class="{ disabled: st.dt.numPedido }"> -->
  <div>
    <!-- Si tiene pedido estará inhabilidado -->
    <!-- Importante: el layout del formulario tiene que ser horizontal y en cada componente en el
    div principal debe ir la clase componente-inline -->
    <a-form
      :nativeEnterKey="false"
      layout="horizontal"
      :model="st.dt"
      :validate-messages="validateMessages"
      name="principal"
      @finish="validaciones"
      @finishFailed="formIncompleto"
    >
      <!-- Los divs son necesarios para crear el salto de línea, de lo contrario si se cambiara la resolución saldrían juntos -->
      <div>
        <TipoSolicitud />
      </div>
      <div>
        <ImputacionSociedad />
      </div>
      <div>
        <!-- <DireccionContacto /> -->
      </div>
      <div>
        <ProveedorCompras />
      </div>
      <div class="contenedor-flex">
        <CuentasProveedor />
        <CuentaBancaria />
      </div>
      <div>
        <Observaciones />
      </div>
      <LogErrores v-if="mostarErrores" @ocultarLogErrores="ocultarLogErrores" :errores="errValidacion"></LogErrores>
      <UploadFiles />
      <GuardarSalir />
    </a-form>
  </div>
</template>

<script setup>
import { Modal } from 'ant-design-vue';
import { onMounted, ref } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { fechaVacia } from '../helpers/fechas';
//Pinia
import { useStore } from '../stores/store';
const st = useStore();
const mostarErrores = ref(false);
let errValidacion = [];
const route = useRoute();
const { id } = route.params; //obtenemos el id de la SC que viene como parámetro en la ruta

onBeforeRouteLeave(async (to, from) => {
  // este guard se lanzará cuando salgamos de la página bien sea pulsando el botón atrás del navegador
  // o con el botón Salir del programa
  // para cancelar la acción de volver atrás tenemos que devolver false

  //Si no ha habido cambios continuaremos (vuelve en nuestro caso al listado de solicitudes)
  if (JSON.stringify(st.dt) === JSON.stringify(st.dtInicial)) return true;
  // console.log(JSON.stringify(st.dt));
  // console.log(JSON.stringify(st.dtInicial));

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

const ocultarLogErrores = () => {
  mostarErrores.value = false;
};

const validaciones = () => {
  // Las validaciones realizadas con rules en el formulario son correctas
  // Comprobamos otras validaciones
  errValidacion = [];
  //Mostramos el modal con los errores, es necesario ya que con el modal.error no funcionan los saltos de línea
  if (errValidacion.length > 0) {
    mostarErrores.value = true;
  } else {
    // Todo ok, guardamos los cambios
    st.guardar();
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
</style>
