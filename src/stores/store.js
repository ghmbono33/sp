import { message } from 'ant-design-vue';
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { httpJSONP } from '../helpers/http';
import { urlParam } from '../helpers/varios';

export const useStore = defineStore('store', () => {
  // globales que no corresponden a una solicitud concreta
  const gb = reactive({
    inicioPrograma: true,
    viasPago: [],
    optSociedades: [],
  });

  const initialState = {
    id: '0', //nº solicitud compra
    tipoSolicitud: '', //1 pago factura, 2 pago anticipado, 3 aportación UTE, 4 otros
    textoTipoSolicitud: '',
    importe: 0,
    fecSolicitud: fechaSolicitud(),
    sociedad: '',
    tipoImputacion: '',
    elementoImputacion: '',
    textoElementoImputacion: '',
    codProv: '',
    nomProv: '',
    receptor_pago: '',
    nifProv: '',
    viaPago: '',
    estado: '',
    inmovilizado: false,
    bancos: [],
    iban: '',
    iban_pais: 'ES',
    iban_iban: '',
    iban_banco: '',
    iban_sucursal: '',
    iban_dc: '',
    iban_cuenta: '',
    fec_pago: '',
    justif_pago: false,
    observa: '',
    solicitudes: [], //tabla/grid  (pantalla principal búsqueda solicitudes)
    fecDesde: '', //fecha filtro en el listado de SC
    fecHasta: '', //fecha filtro en el listado de SC
    conPedido: '', //filtro en el listado de SC
    colaborador: '', //filtro colaborador seleccionado (solo para los responsables)
    cebe: '', //filtro cebe (para aquellos que en ZTCO002 tienen asignado Centros o Elem. Pep)
    numPedido: '',
    numSolicitud: '', //filtro en el listado de SC
    ficheros: '', // ficheros adjuntos separados por |
  };
  // En aux guardamos otros valores auxiliares que compartimos pero que no son datos
  // intrínsicos de la SC.
  const aux = reactive({ idDestinoCopia: '' }); //id copia solicitud destino
  let dt = reactive({ ...initialState });
  let dtInicial = reactive({ ...initialState }); //datos iniciales, nos sirve para comprobar si se han producido cambios
  let dtBusqueda = reactive({ ...initialState }); //datos de búsqueda
  let ultimoIdTratado = 0; //último id de SC consultado o creado
  let modificada = false; //para saber si una SC ya existente ha sido guardada/modificada.
  const loading = ref(false);
  const localeConfig = {
    emptyText: 'No hay entradas', // Texto que se mostrará cuando la tabla está vacía
  };

  const opcTipoSolicitud = [
    { label: 'Pago de Factura', value: '1' },
    { label: 'Pago anticipado a proveedores', value: '2' },
    { label: 'Aportación UTES', value: '3' },
    { label: 'Otros', value: '4' },
  ];

  //Columnas del listado de solicitudes
  const colSolicitudes = [
    {
      title: 'Solicitante',
      dataIndex: 'solicitante',
      width: '5%',
    },
    {
      title: 'Nº',
      dataIndex: 'id',
      width: '3%',
    },
    {
      title: 'F. Solicitud',
      dataIndex: 'fecSolicitud',
      width: '4%',
    },
    {
      title: 'Elemento de Imputación',
      dataIndex: 'txtElemImp',
      width: '21%',
    },
    {
      title: 'Sociedad',
      dataIndex: 'sociedad',
      width: '3.5%',
    },
    {
      title: 'Proveedor',
      dataIndex: 'proveedor',
      width: '16%',
    },
    {
      title: 'Nº Pedido',
      dataIndex: 'numPedido',
      width: '4%',
    },

    {
      dataIndex: 'importe',
      title: 'Importe Total',
      width: '5%',
      align: 'right',
    },
    {
      dataIndex: 'copiar',
      title: 'Copiar',
      width: '4%',
      align: 'center',
    },
    {
      // dataIndex: 'borrar',
      dataIndex: 'borrar',
      title: 'Borrar',
      width: '3%',
      align: 'center',
    },
  ];

  // obtenemos los colaboradores de un responsable (si no lo es el array estará vacío)
  // el nº control será solo para mí para emular que soy otra persona
  const numcontrol = urlParam('numcontrol');

  const resetData = () => {
    Object.assign(dt, initialState); // hace una copia de initialState en dt
    Object.assign(dtInicial, initialState); // hace una copia de initialState en dtInicial
  };

  const getSolicitud = async (id) => {
    resetData(); // Reiniciamos los datos
    ultimoIdTratado = id; //ultimo id consultado
    // Obtenemos la solucitud correspondiente al id para mostrarla en SolicitudView
    const url = 'leer_jsonp.asp';
    const payload = { id };
    try {
      const datos = await httpJSONP(url, payload);
      debugger;
      const data = datos[0];
      dt.id = id;
      dt.tipoSolicitud = data.tipoSolPago;
      dt.fecSolicitud = data.fecSolicitud;
      dt.numPedido = data.numPedido;
      dt.importe = data.importe;
      dt.tipoImputacion = data.tipoImp;
      dt.elementoImputacion = data.elemImp;
      dt.textoElementoImputacion = data.txtElemImp;
      dt.sociedad = data.sociedad + '-' + data.nomSociedad;
      dt.codProv = data.codProv;
      dt.nomProv = data.nomProv;
      dt.nifProv = data.nifProv;
      dt.viaPago = data.viaPago;
      dt.observa = data.observa;
      dt.ficheros = data.ficheros;
      dt.fec_pago = data.fec_pago;
      dt.justif_pago = data.justif_pago === 'X';
      dt.inmovilizado = data.inmovilizado === 'X';
      dt.estado = data.estado;
      dt.receptor_pago = data.receptor_pago;

      //Datos de las cuentas bancarias del proveedor, accedemos por código y nos quedamos con el primer resultado ya que el código de proveedor es único
      const pload = { proveedor: 'C' + dt.codProv };
      const datos_prov = await httpJSONP('busquedas_jsonp.asp', pload);
      dt.bancos = datos_prov[0].bancos ? datos_prov[0].bancos.split(',') : [];
      // Cuenta bancaria introducida/seleccionada por el usuario
      if (dt.iban.trim() === '') {
        dt.iban_iban = data.iban.slice(0, 4);
        dt.iban_banco = data.iban.slice(4, 8);
        dt.iban_sucursal = data.iban.slice(8, 12);
        dt.iban_dc = data.iban.slice(12, 14);
        dt.iban_cuenta = data.iban.slice(14, 24);
      }

      //copiamos dt en dtInicial
      Object.assign(dtInicial, dt);
    } catch (error) {
      console.log(error);
    }
  };

  const getSolicitudes = async (id, actualizarDtBusqueda = true) => {
    // Obtenemos las solicitudes que se mostrarán en el listado/tabla principal de la aplicación
    const url = 'leer_jsonp.asp';
    const payload = {
      idTabla: id, //obtiene la sc del id
      elemImp: dt.elementoImputacion,
      tipoImp: dt.tipoImputacion,
      fecDesde: fechaSap(dt.fecDesde),
      fecHasta: fechaSap(dt.fecHasta),
      conPedido: dt.conPedido || '',
      codProv: dt.codProv,
      colaborador: dt.colaborador,
      cebe: dt.cebe,
      numcontrol /* el nº de control recogido por la url (en el caso que quiera obtener las SC de alguien en concreto) */,
    };
    try {
      loading.value = true;
      dt.solicitudes = await httpJSONP(url, payload);
      //sacamos una copia de dt para que al volver  la búsqueda podamos recuperarla
      //copia dt en dtBusqueda
      if (actualizarDtBusqueda) Object.assign(dtBusqueda, dt);
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  };

  const reestablecerFiltroTabla = async () => {
    // ------------------------------------------------------------------------------------
    //Tras haber entrado a modificar una solicitud, una vez el usuario guarda ésta necesitamos
    //recuperar en ListadoView no solo los filtros anteriores sino también los datos de la tabla/grid,
    //estos se encuentran en dtBusqueda.
    //Para no tener que ejecutar nuevamente la petición http lo que se hace es modificar únicamente la
    //fila correspondiente a la SC modificada o si se trata de una nueva entrada o copia lo que se hace
    //es añadirla a la tabla/grid
    // ------------------------------------------------------------------------------------

    if (!ultimoIdTratado) return; //todavía no se ha entrado a ninguna solicitud

    if (modificada) {
      modificada = false;
      // recuperamos la información de la solicitud creada o modificada que tras esta instrucción estará
      // en dt.solicitudes[0]
      await getSolicitudes(ultimoIdTratado, false); //pasamos false para que no se actualice dtBusqueda
      //En dtBusqueda.solicitudes tenemos el array de solicitudes de la tabla/grid
      // comprobamos si el nuevoId está en la lista de ids de las solicitudes (si no está es que ha sido
      // una nueva solicitud o una copia)
      const nuevo = !dtBusqueda.solicitudes.map((e) => e.id).includes(+ultimoIdTratado); //+ultimo para pasar a numero
      if (nuevo) {
        // añadimos el nuevo al principio de la tabla/grid
        dtBusqueda.solicitudes.unshift(dt.solicitudes[0]);
      } else {
        //solo actualizamos el modificado
        dtBusqueda.solicitudes = dtBusqueda.solicitudes.map((e) => (e.id != ultimoIdTratado ? e : dt.solicitudes[0]));
      }
    }
    //copiamos dtBusqueda en dt para que se refleje en el grid;
    Object.assign(dt, dtBusqueda);
  };

  const guardar = async () => {
    modificada = true;
    debugger;
    const textoTipoSolicitud = opcTipoSolicitud.find((o) => o.value === dt.tipoSolicitud)?.label || '';
    const payload = {
      id: dt.id,
      importe: dt.importe,
      numpedido: dt.numPedido,
      tipoImp: dt.tipoImputacion,
      elemImp: dt.elementoImputacion,
      sociedad: dt.sociedad.substring(0, 4),
      codProv: dt.codProv,
      nomprov: dt.nomProv,
      nifProv: dt.nifProv,
      receptor_pago: dt.receptor_pago,
      estado: dt.estado,
      viaPago: dt.viaPago,
      tipoSolPago: dt.tipoSolicitud,
      iban: dt.iban,
      observa: dt.observa,
      inmovilizado: dt.inmovilizado ? 'X' : '',
      justif_pago: dt.justif_pago ? 'X' : '',
      fec_pago: fechaSap(dt.fec_pago),
      textoImputacion: dt.textoElementoImputacion,
      textoTipoSolicitud: textoTipoSolicitud,
      // ficheros: dt.ficheros,
    };
    try {
      let nuevaSC = false;
      const url = 'Guardar_jsonp.asp';
      loading.value = true;
      // guardamos y obtenemos el id, solo será necesario si es una nueva SC
      const { id } = await httpJSONP(url, payload);
      if (dt.id === '0') {
        dt.id = +id; //nueva SC, asignamos el nº de nuevo id  el + es para que convierta a numero
        ultimoIdTratado = dt.id; //ultimo Id modificado
        nuevaSC = true;
      }

      // Se ha guardado correctamente
      //actualizamos dtInicial con el valor de dt para que al pulsar el botón salir tenga en cuenta si han
      //habido cambios después de pulsar guardar
      Object.assign(dtInicial, dt);
      message.success(`Se ha ${nuevaSC ? 'creado' : 'guardado'} la solicitud de pago nº ${dt.id}`, 1.5);
    } catch (error) {
      console.error('Error en la solicitud:', error);
      return message.error('Ha habido algun problema al guardar la solicitud de pago', 1.5);
    } finally {
      loading.value = false;
    }
  };

  const lineasTextArea = (texto) => {
    // Genera líneas que no tengan más de 60 caracteres respetando los saltos de líneas.
    // Es necesario ya que en SAP copian la información de la SC a los pedidos donde no
    // admite más de 60 caracteres
    // Devuelve el texto separado por crlf en cada línea
    const longitudMaxima = 60;

    const lineas = [];
    let lineaActual = '';

    // Dividir el texto en líneas respetando los saltos de línea
    const lineasTexto = texto.split('\n');

    lineasTexto.forEach((lineaTexto) => {
      const palabras = lineaTexto.split(' ');
      palabras.forEach((palabra) => {
        const posibleLinea = lineaActual + (lineaActual === '' ? '' : ' ') + palabra;
        if (posibleLinea.length <= longitudMaxima) {
          lineaActual = posibleLinea;
        } else {
          lineas.push(lineaActual);
          lineaActual = palabra;
        }
      });
      // Agregar la última línea de esta sección
      if (lineaActual !== '') {
        lineas.push(lineaActual);
        lineaActual = '';
      }
    });

    // Agregar las líneas restantes
    if (lineaActual !== '') {
      lineas.push(lineaActual);
    }
    // Devolvemos la línea con salto de línea para que lo interpreta Guardar_json.asp
    return lineas.join('crlf');
  };

  const fechaSap = (fecha) => {
    if (!fecha) return '00000000';
    // la fecha viene como 2023-05-31 y queremos quitar los - para dejar 20230531
    return fecha.replaceAll('-', '');
  };

  function fechaSolicitud() {
    // Formate la fecha de hoy con formato "YYYY-MM-DD" que es el formato que requiere
    // el a-input de Vue Ant Design
    const fechaHoy = new Date();

    // Obtener los componentes de la fecha
    const year = fechaHoy.getFullYear();
    const month = String(fechaHoy.getMonth() + 1).padStart(2, '0');
    const day = String(fechaHoy.getDate()).padStart(2, '0');

    // Formatear la fecha
    return `${year}-${month}-${day}`;
  }

  return {
    gb,
    dt,
    aux,
    loading,
    getSolicitudes,
    getSolicitud,
    guardar,
    fechaSap,
    localeConfig,
    resetData,
    initialState,
    dtInicial,
    dtBusqueda,
    reestablecerFiltroTabla,
    colSolicitudes,
    numcontrol,
    opcTipoSolicitud,
  };
});
