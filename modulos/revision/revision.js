/*
 * revision.js
 * listado de cursos pendientes de revision (cursos con aprobado = false)
 */
const RevisionListado = (function () {
    'use strict';

    const CLAVE_CURSOS = 'cursos'; // misma clave que lee el listado de cursos
    const REGISTROS_POR_PAGINA = 10;

    let paginaActual = 1;

    let contador = null;
    let cuerpoTabla = null;
    let mensajeVacio = null;
    let botonAnterior = null;
    let botonSiguiente = null;
    let indicadorPagina = null;

    function compararPorCodigo(a, b) {
        return String(a.codigo).localeCompare(String(b.codigo), 'es', { numeric: true, sensitivity: 'base' });
    }

    function obtenerPendientes() {
        const cursos = Almacenamiento.obtener(CLAVE_CURSOS, []);
        return (Array.isArray(cursos) ? cursos : [])
            .filter((curso) => curso.aprobado === false)
            .sort(compararPorCodigo);
    }

    function crearCelda(texto) {
        const celda = document.createElement('td');
        celda.textContent = texto || '—';
        return celda;
    }

    function crearFila(curso) {
        const fila = document.createElement('tr');

        fila.appendChild(crearCelda(String(curso.codigo)));
        fila.appendChild(crearCelda(curso.nombre));
        fila.appendChild(crearCelda(curso.escuela));

        const celdaAcciones = document.createElement('td');
        celdaAcciones.className = 'columna-acciones';

        const botonRevisar = document.createElement('button');
        botonRevisar.type = 'button';
        botonRevisar.className = 'boton-secundario';
        botonRevisar.textContent = 'Revisar';
        botonRevisar.setAttribute('aria-label', `Revisar ${curso.nombre || curso.codigo}`);
        botonRevisar.addEventListener('click', () => {
            Enrutador.irA(`revision.html?codigo=${encodeURIComponent(curso.codigo)}`);
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
        contador = document.getElementById('revision-contador');
        cuerpoTabla = document.getElementById('revision-cuerpo');
        mensajeVacio = document.getElementById('revision-vacio');
        botonAnterior = document.getElementById('revision-anterior');
        botonSiguiente = document.getElementById('revision-siguiente');
        indicadorPagina = document.getElementById('revision-pagina');

        registrarEventos();
        renderizar();
    }

    return { iniciar };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Almacenamiento !== 'undefined' && typeof Enrutador !== 'undefined') {
        RevisionListado.iniciar();
    } else {
        console.error('Faltan dependencias');
    }
});