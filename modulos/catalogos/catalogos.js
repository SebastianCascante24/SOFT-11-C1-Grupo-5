const Catalogos = {
  NOMBRE_MINIMO: 3,
  DESCRIPCION_MAXIMA: 500,
  CONFIGURACION: {
    'areas-sfia': {
      titulo: 'Área SFIA',
      tituloPlural: 'Áreas SFIA',
      codigo: { tipo: 'entero', mensajeDuplicado: 'Ya existe un área SFIA con este código.' },
      descripcion: { visible: true, obligatoria: false }
    },
    'tematicas': {
      titulo: 'Temática',
      tituloPlural: 'Temáticas',
      codigo: { tipo: 'entero', mensajeDuplicado: 'Ya existe una temática con este código.' },
      descripcion: { visible: true, obligatoria: false }
    },
    'metodologias': {
      titulo: 'Metodología de aprendizaje',
      tituloPlural: 'Metodologías de aprendizaje',
      codigo: { tipo: 'entero', mensajeDuplicado: 'Ya existe una metodología con este código.' },
      descripcion: { visible: true, obligatoria: true }
    },
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
  },

  esActivo(registro) {
    return registro.activo !== false;
  },
};

// logica del listado

const ListadoCatalogo = (function () {
  'use strict';

  const REGISTROS_POR_PAGINA = 10;
  const ETIQUETAS_FILTRO = { codigo: 'Código', nombre: 'Nombre', estado: 'Estado' };
  const TEXTO_ESTADO = { activo: 'Activo', inactivo: 'Inactivo' };

  let idCatalogo = null;
  let configuracion = null;
  let paginaActual = 1;
  const filtros = { codigo: '', nombre: '', estado: 'todos' };

  let contenidoListado = null;
  let tituloListado = null;
  let enlaceAgregarListado = null;
  let formularioFiltrosListado = null;
  let botonLimpiarFiltrosListado = null;
  let contenedorFiltrosActivosListado = null;
  let listaFiltrosActivosListado = null;
  let cuerpoTablaListado = null;
  let mensajeVacioListado = null;
  let botonAnteriorListado = null;
  let botonSiguienteListado = null;
  let indicadorPaginaListado = null;
  let contadorListado = null;
  const camposFiltrosListado = {};

  function coincideConFiltrosListado(registro) {
    const codigo = Formateadores.normalizarTexto(registro.codigo);
    const nombre = Formateadores.normalizarTexto(registro.nombre);

    if (!codigo.includes(Formateadores.normalizarTexto(filtros.codigo))) return false;
    if (!nombre.includes(Formateadores.normalizarTexto(filtros.nombre))) return false;
    if (filtros.estado === 'activo' && !Catalogos.esActivo(registro)) return false;
    if (filtros.estado === 'inactivo' && Catalogos.esActivo(registro)) return false;
    return true;
  }

  function compararPorCodigoListado(a, b) {
    if (typeof a.codigo === 'number' && typeof b.codigo === 'number') {
      return a.codigo - b.codigo;
    }
    return String(a.codigo).localeCompare(String(b.codigo), 'es', { numeric: true, sensitivity: 'base' });
  }

  function crearCeldaListado(texto) {
    const celda = document.createElement('td');
    celda.textContent = texto;
    return celda;
  }

  function crearFilaListado(registro) {
    const activo = Catalogos.esActivo(registro);
    const fila = document.createElement('tr');

    fila.appendChild(crearCeldaListado(String(registro.codigo)));
    fila.appendChild(crearCeldaListado(registro.nombre));
    fila.appendChild(crearCeldaListado(activo ? TEXTO_ESTADO.activo : TEXTO_ESTADO.inactivo));

    const celdaAcciones = document.createElement('td');
    celdaAcciones.className = 'columna-acciones';

    const botonModificar = document.createElement('button');
    botonModificar.type = 'button';
    botonModificar.className = 'boton-secundario';
    botonModificar.textContent = 'Modificar';
    botonModificar.setAttribute('aria-label', `Modificar ${registro.nombre}`);

    const botonEstado = document.createElement('button');
    botonEstado.type = 'button';
    botonEstado.className = 'boton-secundario';
    botonEstado.textContent = activo ? 'Desactivar' : 'Activar';
    botonEstado.setAttribute('aria-label', `${activo ? 'Desactivar' : 'Activar'} ${registro.nombre}`);

    celdaAcciones.append(botonModificar, botonEstado);
    fila.appendChild(celdaAcciones);
    return fila;
  }

  function renderizarFiltrosActivosListado() {
    const activos = [];
    if (filtros.codigo.trim() !== '') activos.push({ campo: 'codigo', valor: filtros.codigo.trim() });
    if (filtros.nombre.trim() !== '') activos.push({ campo: 'nombre', valor: filtros.nombre.trim() });
    if (filtros.estado !== 'todos') activos.push({ campo: 'estado', valor: TEXTO_ESTADO[filtros.estado] });

    listaFiltrosActivosListado.replaceChildren();
    contenedorFiltrosActivosListado.hidden = activos.length === 0;

    activos.forEach((filtro) => {
      const etiqueta = ETIQUETAS_FILTRO[filtro.campo];

      const elemento = document.createElement('li');
      const texto = document.createElement('span');
      texto.textContent = filtro.campo === 'estado'
        ? `${etiqueta}: ${filtro.valor}`
        : `${etiqueta} contiene: ${filtro.valor}`;

      const botonQuitar = document.createElement('button');
      botonQuitar.type = 'button';
      botonQuitar.textContent = '×';
      botonQuitar.setAttribute('aria-label', `Quitar filtro ${etiqueta}`);
      botonQuitar.addEventListener('click', () => quitarFiltroListado(filtro.campo));

      elemento.append(texto, botonQuitar);
      listaFiltrosActivosListado.appendChild(elemento);
    });

    return activos.length;
  }

  function textoContadorListado(total, inicio, cantidadEnPagina) {
    if (total === 0) return '0 registros';

    const primero = inicio + 1;
    const ultimo = inicio + cantidadEnPagina;
    const rango = primero === ultimo ? `${primero}` : `${primero}–${ultimo}`;
    return `Mostrando ${rango} de ${total} ${total === 1 ? 'registro' : 'registros'}`;
  }

  function renderizarListado() {
    const registros = Catalogos.obtenerRegistros(idCatalogo)
      .filter(coincideConFiltrosListado)
      .sort(compararPorCodigoListado);

    const totalPaginas = Math.max(1, Math.ceil(registros.length / REGISTROS_POR_PAGINA));
    paginaActual = Math.min(paginaActual, totalPaginas);

    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    const registrosPagina = registros.slice(inicio, inicio + REGISTROS_POR_PAGINA);
    cuerpoTablaListado.replaceChildren();
    registrosPagina.forEach((registro) => cuerpoTablaListado.appendChild(crearFilaListado(registro)));
    contadorListado.textContent = textoContadorListado(registros.length, inicio, registrosPagina.length);

    const hayFiltros = renderizarFiltrosActivosListado() > 0;
    mensajeVacioListado.hidden = registros.length > 0;
    mensajeVacioListado.textContent = hayFiltros
      ? 'No hay registros que coincidan con los filtros.'
      : 'Aún no hay registros en este catálogo.';

    indicadorPaginaListado.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    botonAnteriorListado.disabled = paginaActual <= 1;
    botonSiguienteListado.disabled = paginaActual >= totalPaginas;
  }

  function quitarFiltroListado(campo) {
    if (campo === 'estado') {
      filtros.estado = 'todos';
      camposFiltrosListado.estado.value = 'todos';
    } else {
      filtros[campo] = '';
      camposFiltrosListado[campo].value = '';
    }
    paginaActual = 1;
    renderizarListado();
  }

  function limpiarFiltrosListado() {
    filtros.codigo = '';
    filtros.nombre = '';
    filtros.estado = 'todos';
    camposFiltrosListado.codigo.value = '';
    camposFiltrosListado.nombre.value = '';
    camposFiltrosListado.estado.value = 'todos';
    paginaActual = 1;
    renderizarListado();
  }

  function registrarEventosListado() {
    camposFiltrosListado.codigo.addEventListener('input', () => {
      filtros.codigo = camposFiltrosListado.codigo.value;
      paginaActual = 1;
      renderizarListado();
    });

    camposFiltrosListado.nombre.addEventListener('input', () => {
      filtros.nombre = camposFiltrosListado.nombre.value;
      paginaActual = 1;
      renderizarListado();
    });

    camposFiltrosListado.estado.addEventListener('change', () => {
      filtros.estado = camposFiltrosListado.estado.value;
      paginaActual = 1;
      renderizarListado();
    });

    formularioFiltrosListado.addEventListener('submit', (evento) => evento.preventDefault());
    botonLimpiarFiltrosListado.addEventListener('click', limpiarFiltrosListado);

    botonAnteriorListado.addEventListener('click', () => {
      paginaActual -= 1;
      renderizarListado();
    });

    botonSiguienteListado.addEventListener('click', () => {
      paginaActual += 1;
      renderizarListado();
    });
  }

  // inicio

  function iniciar() {
    contenidoListado = document.getElementById('listado-catalogo-contenido');
    if (!contenidoListado) return; // La página actual no es listado.html

    tituloListado = document.getElementById('listado-catalogo-titulo');
    enlaceAgregarListado = document.getElementById('listado-catalogo-agregar');
    formularioFiltrosListado = document.getElementById('listado-catalogo-formulario');
    botonLimpiarFiltrosListado = document.getElementById('listado-catalogo-limpiar-filtros');
    contenedorFiltrosActivosListado = document.getElementById('listado-catalogo-filtros-activos');
    listaFiltrosActivosListado = document.getElementById('listado-catalogo-lista-filtros');
    cuerpoTablaListado = document.getElementById('listado-catalogo-cuerpo');
    mensajeVacioListado = document.getElementById('listado-catalogo-vacio');
    botonAnteriorListado = document.getElementById('listado-catalogo-anterior');
    botonSiguienteListado = document.getElementById('listado-catalogo-siguiente');
    indicadorPaginaListado = document.getElementById('listado-catalogo-pagina');
    contadorListado = document.getElementById('listado-catalogo-contador');
    camposFiltrosListado.codigo = document.getElementById('listado-catalogo-filtro-codigo');
    camposFiltrosListado.nombre = document.getElementById('listado-catalogo-filtro-nombre');
    camposFiltrosListado.estado = document.getElementById('listado-catalogo-filtro-estado');

    idCatalogo = Enrutador.obtenerParametro('catalogo');
    configuracion = Catalogos.obtenerConfiguracion(idCatalogo);

    if (!configuracion) {
      tituloListado.textContent = 'Catálogo no disponible';
      contenidoListado.hidden = true;
      Notificacion.mostrar('error', 'Este catálogo no está disponible por ahora. Seleccione otro desde el menú lateral.');
      return;
    }

    document.title = `${configuracion.tituloPlural} | Desarrollo Curricular y Docente`;
    tituloListado.textContent = configuracion.tituloPlural;
    enlaceAgregarListado.href = `formulario.html?catalogo=${encodeURIComponent(idCatalogo)}`;
    Catalogos.marcarCatalogoActivoEnMenu(idCatalogo);

    registrarEventosListado();
    renderizarListado();
  }

  return { iniciar };
})();

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

ListadoCatalogo.iniciar();
FormularioCatalogo.iniciar();