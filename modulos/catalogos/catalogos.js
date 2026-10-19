const Catalogos = {
  NOMBRE_MINIMO: 3,
  DESCRIPCION_MAXIMA: 500,
  CONFIGURACION: {
    'areas-sfia': {
      titulo: 'Área SFIA',
      codigo: { tipo: 'entero', mensajeDuplicado: 'Ya existe un área SFIA con este código.' },
      descripcion: { visible: true, obligatoria: false }
    }
  },

  obtenerConfiguracion(idCatalogo) {
    return Catalogos.CONFIGURACION[idCatalogo] || null;
  },

  obtenerRegistros(idCatalogo) {
    return Almacenamiento.obtener(`catalogo_${idCatalogo}`, []);
  },

  buscarRegistro(idCatalogo, codigo) {
    return Catalogos.obtenerRegistros(idCatalogo)
      .find((registro) => String(registro.codigo) === String(codigo));
  },

  agregarRegistro(idCatalogo, registro) {
    const registros = Catalogos.obtenerRegistros(idCatalogo);
    registros.push(registro);
    return Almacenamiento.guardar(`catalogo_${idCatalogo}`, registros);
  },

  normalizarCodigo(idCatalogo, valor) {
    const config = Catalogos.obtenerConfiguracion(idCatalogo);
    return config.codigo.tipo === 'entero' ? Number(valor) : String(valor).trim();
  },

  marcarCatalogoActivoEnMenu(idCatalogo) {
    const enlace = document.querySelector(`nav a[data-catalogo="${idCatalogo}"]`);
    if (enlace) enlace.setAttribute('aria-current', 'page');
  }
};

// logica del formulario

const FormularioCatalogo = (function () {
  'use strict';

  let idCatalogo = null;
  let configuracion = null;

  let formularioCatalogo = null;
  let tituloCatalogo = null;
  let enlaceVolverCatalogo = null;
  let errorGeneralCatalogo = null;
  let grupoDescripcionCatalogo = null;
  let marcaDescripcionCatalogo = null;
  let botonLimpiarCatalogo = null;
  const camposCatalogo = {};

  const reglasCatalogo = [];

  function validarCodigoCatalogo() {
    const valor = camposCatalogo.codigo.value.trim();

    if (Validadores.estaVacio(valor)) return 'Ingrese el código.';
    if (!Validadores.esEnteroPositivo(valor)) return 'Ingrese un código entero positivo.';

    if (Catalogos.buscarRegistro(idCatalogo, Catalogos.normalizarCodigo(idCatalogo, valor))) {
      return configuracion.codigo.mensajeDuplicado;
    }
    return '';
  }

  function validarNombreCatalogo() {
    const valor = camposCatalogo.nombre.value;
    if (Validadores.estaVacio(valor) ||
      !Validadores.tieneLongitudMinima(valor, Catalogos.NOMBRE_MINIMO)) {
      return 'Ingrese el nombre (mínimo 3 caracteres)';
    }
    return '';
  }

  function validarDescripcionCatalogo() {
    const valor = camposCatalogo.descripcion.value;

    if (configuracion.descripcion.obligatoria && Validadores.estaVacio(valor)) {
      return 'Ingrese la descripción.';
    }
    if (Validadores.superaLongitudMaxima(valor, Catalogos.DESCRIPCION_MAXIMA)) {
      return 'La descripción no puede superar 500 caracteres.';
    }
    return '';
  }

  function validarCampoCatalogo(regla) {
    const mensaje = regla.validar();
    if (mensaje) {
      Notificacion.mostrarErrorCampo(regla.campo, mensaje);
      return false;
    }
    Notificacion.limpiarErrorCampo(regla.campo);
    return true;
  }

  function limpiarFormularioCatalogo() {
    reglasCatalogo.forEach((regla) => {
      regla.campo.value = '';
      Notificacion.limpiarErrorCampo(regla.campo);
    });
    Notificacion.limpiarErrorGeneral(errorGeneralCatalogo);
  }

  function manejarEnvioCatalogo(evento) {
    evento.preventDefault();
    Notificacion.limpiarErrorGeneral(errorGeneralCatalogo);

    const invalidas = reglasCatalogo.filter((regla) => !validarCampoCatalogo(regla));

    if (invalidas.length > 0) {
      Notificacion.mostrarErrorGeneral(
        errorGeneralCatalogo,
        'Hay datos que necesitan revisión. Corrija los campos señalados.'
      );
      invalidas[0].campo.focus();
      return;
    }

    const registro = {
      codigo: Catalogos.normalizarCodigo(idCatalogo, camposCatalogo.codigo.value),
      nombre: camposCatalogo.nombre.value.trim(),
      activo: true
    };
    if (configuracion.descripcion.visible) {
      registro.descripcion = camposCatalogo.descripcion.value.trim();
    }

    if (!Catalogos.agregarRegistro(idCatalogo, registro)) {
      Notificacion.mostrar('error', 'No se pudo guardar el registro. Intente de nuevo.');
      return;
    }

    Notificacion.mostrar('exito', 'Registro creado correctamente.');
    limpiarFormularioCatalogo();
    camposCatalogo.codigo.focus();
  }

  // visual

  function mostrarVistaCatalogoNoDisponible() {
    tituloCatalogo.textContent = 'Catálogo no disponible';
    formularioCatalogo.hidden = true;
    Notificacion.mostrar('error', 'Este catálogo no está disponible por ahora. Seleccione otro desde el menú lateral.');
  }

  function configurarVistaCatalogo() {
    document.title = `Crear ${configuracion.titulo} | Desarrollo Curricular y Docente`;
    tituloCatalogo.textContent = `Crear ${configuracion.titulo}`;
    enlaceVolverCatalogo.href = `listado.html?catalogo=${encodeURIComponent(idCatalogo)}`;
    Catalogos.marcarCatalogoActivoEnMenu(idCatalogo);

    camposCatalogo.codigo.type = 'number';
    camposCatalogo.codigo.min = '1';
    camposCatalogo.codigo.step = '1';

    camposCatalogo.codigo.placeholder = 'Número entero positivo';
    camposCatalogo.nombre.placeholder = `Mínimo ${Catalogos.NOMBRE_MINIMO} caracteres`;
    camposCatalogo.descripcion.placeholder = `Máximo ${Catalogos.DESCRIPCION_MAXIMA} caracteres`;

    grupoDescripcionCatalogo.hidden = !configuracion.descripcion.visible;
    camposCatalogo.descripcion.required = configuracion.descripcion.obligatoria;
    marcaDescripcionCatalogo.hidden = !configuracion.descripcion.obligatoria;

    reglasCatalogo.push({ campo: camposCatalogo.codigo, validar: validarCodigoCatalogo });
    reglasCatalogo.push({ campo: camposCatalogo.nombre, validar: validarNombreCatalogo });
    if (configuracion.descripcion.visible) {
      reglasCatalogo.push({ campo: camposCatalogo.descripcion, validar: validarDescripcionCatalogo });
    }
  }

  function registrarEventosCatalogo() {
    reglasCatalogo.forEach((regla) => {
      regla.campo.addEventListener('blur', () => validarCampoCatalogo(regla));

      regla.campo.addEventListener('input', () => {
        if (regla.campo.getAttribute('aria-invalid') === 'true') validarCampoCatalogo(regla);
      });
    });

    formularioCatalogo.addEventListener('submit', manejarEnvioCatalogo);
    botonLimpiarCatalogo.addEventListener('click', limpiarFormularioCatalogo);
  }

  // inicio

  function iniciar() {
    formularioCatalogo = document.getElementById('catalogo-formulario');
    if (!formularioCatalogo) return;

    tituloCatalogo = document.getElementById('catalogo-titulo');
    enlaceVolverCatalogo = document.getElementById('catalogo-enlace-volver');
    errorGeneralCatalogo = document.getElementById('catalogo-error-general');
    grupoDescripcionCatalogo = document.getElementById('catalogo-grupo-descripcion');
    marcaDescripcionCatalogo = document.getElementById('catalogo-marca-descripcion');
    botonLimpiarCatalogo = document.getElementById('catalogo-boton-limpiar');
    camposCatalogo.codigo = document.getElementById('catalogo-codigo');
    camposCatalogo.nombre = document.getElementById('catalogo-nombre');
    camposCatalogo.descripcion = document.getElementById('catalogo-descripcion');

    idCatalogo = Enrutador.obtenerParametro('catalogo');
    configuracion = Catalogos.obtenerConfiguracion(idCatalogo);

    if (!configuracion) {
      mostrarVistaCatalogoNoDisponible();
      return;
    }

    configurarVistaCatalogo();
    registrarEventosCatalogo();
  }

  return { iniciar };
})();

FormularioCatalogo.iniciar();