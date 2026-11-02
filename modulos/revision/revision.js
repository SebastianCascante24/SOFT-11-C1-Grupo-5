/*
 * revision.js
 * listado de cursos pendientes de revision (cursos con status: pendiente de revision)
 */

const Revision = {
    CLAVE_CURSOS: 'cenfotec.hu44.cursos',
    RUTA_LISTADO: 'pendientes.html',

    ESTADO_EN_REVISION: 'Pendiente de revisión',
    ESTADO_APROBADO: 'aprobado',
    ESTADO_DEVUELTO: 'devuelto',

    obtenerCursos() {
        const cursos = Almacenamiento.obtener(this.CLAVE_CURSOS, []);
        return Array.isArray(cursos) ? cursos : [];
    },

    guardarCursos(cursos) {
        return Almacenamiento.guardar(this.CLAVE_CURSOS, cursos);
    },

    esPendiente(curso) {
        return curso.status === this.ESTADO_EN_REVISION;
    }
};

const RevisionListado = (function () {
    'use strict';

    const REGISTROS_POR_PAGINA = 10;

    let paginaActual = 1;

    let contador = null;
    let cuerpoTabla = null;
    let mensajeVacio = null;
    let botonAnterior = null;
    let botonSiguiente = null;
    let indicadorPagina = null;

    function compararPorCodigo(a, b) {
        return String(a.code).localeCompare(String(b.code), 'es', {
            numeric: true,
            sensitivity: 'base'
        });
    }

    function obtenerPendientes() {
        return Revision.obtenerCursos()
            .filter((curso) => Revision.esPendiente(curso))
            .sort(compararPorCodigo);
    }

    function crearCelda(texto) {
        const celda = document.createElement('td');
        celda.textContent = texto || '—';
        return celda;
    }

    function crearFila(curso) {
        const fila = document.createElement('tr');

        fila.appendChild(crearCelda(String(curso.code)));
        fila.appendChild(crearCelda(curso.name));
        fila.appendChild(crearCelda(curso.school));

        const celdaAcciones = document.createElement('td');
        celdaAcciones.className = 'columna-acciones';

        const botonRevisar = document.createElement('button');
        botonRevisar.type = 'button';
        botonRevisar.className = 'boton-secundario';
        botonRevisar.textContent = 'Revisar';
        botonRevisar.setAttribute('aria-label', `Revisar ${curso.name || curso.code}`);

        botonRevisar.addEventListener('click', () => {
            Enrutador.irA(`revision.html?codigo=${encodeURIComponent(curso.code)}`);
        });

        celdaAcciones.appendChild(botonRevisar);
        fila.appendChild(celdaAcciones);

        return fila;
    }

    function textoContador(total, inicio, cantidadEnPagina) {
        if (total === 0) return '0 cursos pendientes';

        const primero = inicio + 1;
        const ultimo = inicio + cantidadEnPagina;
        const rango = primero === ultimo ? `${primero}` : `${primero}–${ultimo}`;

        return `Mostrando ${rango} de ${total} ${total === 1 ? 'curso pendiente' : 'cursos pendientes'}`;
    }

    function renderizar() {
        const pendientes = obtenerPendientes();

        const totalPaginas = Math.max(1, Math.ceil(pendientes.length / REGISTROS_POR_PAGINA));
        paginaActual = Math.min(paginaActual, totalPaginas);

        const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
        const pagina = pendientes.slice(inicio, inicio + REGISTROS_POR_PAGINA);

        cuerpoTabla.replaceChildren();
        pagina.forEach((curso) => cuerpoTabla.appendChild(crearFila(curso)));

        contador.textContent = textoContador(pendientes.length, inicio, pagina.length);

        mensajeVacio.hidden = pendientes.length > 0;
        mensajeVacio.textContent = 'No hay cursos pendientes de revisión.';

        indicadorPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
        botonAnterior.disabled = paginaActual <= 1;
        botonSiguiente.disabled = paginaActual >= totalPaginas;
    }

    function mostrarAvisoResultado() {
        const url = new URL(window.location.href);

        const mensajes = {
            aprobado: 'Curso aprobado correctamente.',
            devuelto: 'Curso devuelto con observaciones.'
        };

        const mensaje = mensajes[url.searchParams.get('resultado')];
        if (!mensaje) return;

        Notificacion.mostrar('exito', mensaje);

        url.searchParams.delete('resultado');
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }

    function registrarEventos() {
        botonAnterior.addEventListener('click', () => {
            paginaActual -= 1;
            renderizar();
        });

        botonSiguiente.addEventListener('click', () => {
            paginaActual += 1;
            renderizar();
        });
    }

    function iniciar() {
        cuerpoTabla = document.getElementById('revision-cuerpo');
        if (!cuerpoTabla) return;

        contador = document.getElementById('revision-contador');
        mensajeVacio = document.getElementById('revision-vacio');
        botonAnterior = document.getElementById('revision-anterior');
        botonSiguiente = document.getElementById('revision-siguiente');
        indicadorPagina = document.getElementById('revision-pagina');

        registrarEventos();
        renderizar();
        mostrarAvisoResultado();
    }

    return { iniciar };
})();

const RevisionCurso = (function () {
    'use strict';

    let codigoCurso = null;
    let curso = null;

    let mensaje = null;
    let contenido = null;
    let seccionResultado = null;
    let accionesRevision = null;
    let enlaceCancelar = null;
    let campoObservaciones = null;

    function valorMostrado(valor) {
        if (valor === null || valor === undefined || valor === '') {
            return 'No registrado';
        }

        if (Array.isArray(valor)) {
            return valor.length ? valor.join(', ') : 'No registrado';
        }

        return String(valor);
    }

    function asignar(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valorMostrado(valor);
    }

    function mostrarCurso() {
        asignar('codigo', curso.code);
        asignar('nombre', curso.name);
        asignar('nombrePower', curso.powerName);
        asignar('escuela', curso.school);
        asignar('carrera', curso.career);
        asignar('estado', curso.status);
        asignar('fechaModificacion', curso.updatedAt);

        asignar('modalidad', curso.modality);
        asignar('creditos', curso.credits);
        asignar('horasClase', curso.classHours);
        asignar('horasExtraclase', curso.extraHours);
        asignar('totalHoras', curso.totalHours);
        asignar('requisitosIndispensables', curso.requirements);
        asignar('requisitosDeseables', curso.desirable);

        asignar('ecommerce', curso.ecommerce);
        asignar('fechaApertura', curso.openingDate);
        asignar('moneda', curso.currency);
        asignar('programa', curso.program);

        asignar('descripcionCorta', curso.shortDescription);
        asignar('descripcionCompleta', curso.longDescription);

        asignar('capacidades', curso.capabilities);
        asignar('certificacion', curso.certification);
        asignar('certificador', curso.certifier);
        asignar('competencias', curso.competencies);
        asignar('complejidad', curso.complexity);
        asignar('perfilEntrada', curso.entryProfile);
        asignar('perfilSalida', curso.exitProfile);
        asignar('palabrasClave', curso.keywords);
        asignar('metaDescripcion', curso.metaDescription);
        asignar('metadata', curso.metadata);
        asignar('sfia', curso.sfia);
        asignar('tematica', curso.topic);
    }

    function mostrarSoloLectura() {
        seccionResultado.hidden = true;
        accionesRevision.hidden = true;
        enlaceCancelar.textContent = 'Volver';

        if (curso.status === Revision.ESTADO_APROBADO) {
            mensaje.textContent = 'Este curso ya fue aprobado.';
        } else if (curso.status === Revision.ESTADO_DEVUELTO) {
            mensaje.textContent = 'Este curso fue devuelto y está a la espera de correcciones.';
        } else {
            mensaje.textContent = 'Este curso no está pendiente de revisión.';
        }
    }

    function guardarResultado(cambios, resultado) {
        const cursos = Revision.obtenerCursos();

        const indice = cursos.findIndex(
            (registro) => String(registro.code) === String(codigoCurso)
        );

        if (indice === -1) {
            Notificacion.mostrar('error', 'No se encontró el curso. Puede que ya no exista.');
            return;
        }

        const sesion = Autenticacion.obtenerSesion();

        cursos[indice] = {
            ...cursos[indice],
            ...cambios,
            observaciones: campoObservaciones.value.trim(),
            fechaRevision: new Date().toISOString(),
            revisadoPor: sesion ? sesion.nombre : ''
        };

        if (!Revision.guardarCursos(cursos)) {
            Notificacion.mostrar('error', 'No se pudo guardar la revisión. Intente de nuevo.');
            return;
        }

        Enrutador.irA(`${Revision.RUTA_LISTADO}?resultado=${resultado}`);
    }

    function aprobar() {
        Notificacion.limpiarErrorCampo(campoObservaciones);
        guardarResultado({ status: Revision.ESTADO_APROBADO }, 'aprobado');
    }

    function devolver() {
        if (Validadores.estaVacio(campoObservaciones.value)) {
            Notificacion.mostrarErrorCampo(
                campoObservaciones,
                'Las observaciones son obligatorias para devolver el curso.'
            );

            campoObservaciones.focus();
            return;
        }

        guardarResultado({ status: Revision.ESTADO_DEVUELTO }, 'devuelto');
    }

    function iniciar() {
        contenido = document.getElementById('revision-contenido');
        if (!contenido) return;

        mensaje = document.getElementById('mensaje');
        seccionResultado = document.getElementById('revision-resultado');
        accionesRevision = document.getElementById('revision-acciones');
        enlaceCancelar = document.getElementById('cancelar');
        campoObservaciones = document.getElementById('observaciones');

        codigoCurso = Enrutador.obtenerParametro('codigo');

        curso = Revision.obtenerCursos().find(
            (registro) => String(registro.code) === String(codigoCurso)
        );

        if (!curso) {
            mensaje.textContent = 'No se encontró el curso. Puede que no exista o que el enlace sea incorrecto.';
            contenido.hidden = true;
            return;
        }

        mostrarCurso();

        if (!Revision.esPendiente(curso)) {
            mostrarSoloLectura();
            return;
        }

        document.getElementById('aprobar').addEventListener('click', aprobar);
        document.getElementById('devolver').addEventListener('click', devolver);

        campoObservaciones.addEventListener('input', () => {
            Notificacion.limpiarErrorCampo(campoObservaciones);
        });
    }

    return { iniciar };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (
        typeof Almacenamiento !== 'undefined' &&
        typeof Enrutador !== 'undefined' &&
        typeof Validadores !== 'undefined' &&
        typeof Notificacion !== 'undefined' &&
        typeof Autenticacion !== 'undefined'
    ) {
        RevisionListado.iniciar();
        RevisionCurso.iniciar();
    } else {
        console.error('Faltan dependencias');
    }
});
