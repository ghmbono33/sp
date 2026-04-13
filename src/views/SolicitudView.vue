<template>
  <div :class="{ disabled: st.dt.id.trim() !== '0' }">
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
        <UploadFiles />
      </template>
      <GuardarSalir />
    </a-form>
  </div>
</template>

<script setup>
import { message, Modal } from 'ant-design-vue';
import { onMounted, ref } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
//Pinia
import { useStore } from '../stores/store';
const st = useStore();
const mostarErrores = ref(false);
let errValidacion = [];
const route = useRoute();
const { id } = route.params; //obtenemos el id de la SC que viene como parámetro en la ruta
const inhabilitarTipoSolicitud = ref(false);

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
    st.dt.iban = st.dt.iban_iban + st.dt.iban_banco + st.dt.iban_sucursal + st.dt.iban_dc + st.dt.iban_cuenta;
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
    await st.guardar();
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
