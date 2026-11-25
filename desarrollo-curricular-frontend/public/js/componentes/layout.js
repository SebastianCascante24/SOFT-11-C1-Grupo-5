/* Inyecta el encabezado, el menu lateral, el enlace de salto y el favicon en cada pagina.
   Se incluye ANTES de autenticacion.js (ese script necesita los botones del encabezado). */
const Layout = (function () {
    // Las paginas en modulos/xxx/ suben dos niveles; index.html esta en la raiz
        const prefijoRaiz = location.pathname.includes('/modulos/') ? '../../' : '';

    const ELEMENTOS_MENU = [
        { texto: 'Inicio', ruta: 'index.html', modulo: '' },
        { texto: 'Usuarios', ruta: 'modulos/usuarios/listado.html', modulo: 'usuarios' },
        { texto: 'Escuelas', ruta: 'modulos/escuelas/listado.html', modulo: 'escuelas' },
        { texto: 'Carreras', ruta: 'modulos/carreras/listado.html', modulo: 'carreras' },
        { texto: 'Cursos', ruta: 'modulos/cursos/listado.html', modulo: 'cursos' },
        { texto: 'Revisión de cursos', ruta: 'modulos/revision/pendientes.html', modulo: 'revision' },
        { texto: 'Áreas SFIA', ruta: 'modulos/catalogos/listado.html?catalogo=areas-sfia', modulo: 'catalogos', catalogo: 'areas-sfia' },
        { texto: 'Temática', ruta: 'modulos/catalogos/listado.html?catalogo=tematicas', modulo: 'catalogos', catalogo: 'tematicas' },
        { texto: 'Metodologías de aprendizaje', ruta: 'modulos/catalogos/listado.html?catalogo=metodologias', modulo: 'catalogos', catalogo: 'metodologias' },
        { texto: 'Casas certificadoras', ruta: 'modulos/catalogos/listado.html?catalogo=casas-certificadoras', modulo: 'catalogos', catalogo: 'casas-certificadoras' },
        { texto: 'Niveles de complejidad', ruta: 'modulos/catalogos/listado.html?catalogo=niveles-complejidad', modulo: 'catalogos', catalogo: 'niveles-complejidad' }
    ];

    function urlDe(ruta) {
        return prefijoRaiz + ruta;
    }

    function construirIcono(nombreArchivo) {
         return `<img src="${urlDe('recursos/imagenes/' + nombreArchivo)}" alt="" width="24" height="24" aria-hidden="true">`;
    }

    function estaActivo(elemento) {
        const rutaActual = location.pathname;
        if (!elemento.modulo) {
            return !rutaActual.includes('/modulos/');
        }
        const enModulo = rutaActual.includes('/modulos/' + elemento.modulo + '/');
        if (!elemento.catalogo) return enModulo;
        return enModulo && new URLSearchParams(location.search).get('catalogo') === elemento.catalogo;
    }

    function construirEnlaceSalto() {
        return '<a class="salto-contenido visually-hidden-focusable" href="#contenido">Saltar al contenido</a>';
    }

    function construirEncabezado() {
        return `
      <header class="app-encabezado navbar bg-white shadow-sm px-3 py-0">
        <a class="app-logo navbar-brand m-0" href="${urlDe('index.html')}" aria-label="Desarrollo Curricular y Docente, ir al inicio">
          <img src="${urlDe('recursos/imagenes/logo-cenfotec.png')}" alt="" height="74">
        </a>

        <div class="d-flex align-items-center gap-2" role="group" aria-label="Opciones de la cuenta">
          <button type="button" class="btn btn-secondary p-2" id="encabezado-notificaciones" title="Notificaciones" aria-label="Notificaciones">${construirIcono('campana-notificaciones.svg')}</button>
          <select id="encabezado-idioma" class="btn-secondary form-select w-auto d-none d-sm-block" aria-label="Idioma">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
          <!-- A de admin por ahora -->
          <button type="button" class="app-avatar btn" id="encabezado-avatar" aria-label="Perfil">A</button>
          <button type="button" class="btn btn-secondary p-2" id="encabezado-cerrar-sesion" title="Cerrar sesión" aria-label="Cerrar sesión">${construirIcono('cerrar-sesion.svg')}</button>
          <button type="button" class="navbar-toggler d-md-none" data-bs-toggle="collapse" data-bs-target="#app-menu-contenedor" aria-controls="app-menu-contenedor" aria-expanded="false" aria-label="Abrir menú">
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>
      </header>`;
    }

    function construirMenu() {
        const enlaces = ELEMENTOS_MENU.map(function (elemento) {
            const atributoCatalogo = elemento.catalogo ? ` data-catalogo="${elemento.catalogo}"` : '';
            const atributoActual = estaActivo(elemento) ? ' aria-current="page"' : '';
            return `<li><a class="nav-link" href="${urlDe(elemento.ruta)}"${atributoCatalogo}${atributoActual}>${elemento.texto}</a></li>`;
        }).join('');

        return `
      <div id="app-menu-contenedor" class="collapse d-md-block col-12 col-md-4 col-lg-3 col-xl-2">
        <nav class="app-menu" aria-label="Menú principal">
          <ul class="nav flex-column">${enlaces}</ul>
        </nav>
      </div>`;
    }

    function agregarFavicon() {
        if (document.querySelector('link[rel="icon"]')) return;
        const enlace = document.createElement('link');
        enlace.rel = 'icon';
        enlace.type = 'image/png';
        enlace.href = urlDe('recursos/imagenes/favicon.png');
        document.head.appendChild(enlace);
    }

    function iniciar() {
        const principal = document.getElementById('contenido');
        if (!principal) return;

        agregarFavicon();
        document.body.insertAdjacentHTML('afterbegin', construirEnlaceSalto() + construirEncabezado());

        // Envuelve <main> en container > row, junto a la columna del menu
        const contenedor = document.createElement('div');
        contenedor.className = 'app-contenedor container-fluid px-3 px-lg-4 py-4 mx-auto';
        contenedor.innerHTML = '<div class="row g-4">' + construirMenu() + '</div>';
        principal.before(contenedor);

        principal.classList.add('col-12', 'col-md-8', 'col-lg-9', 'col-xl-10');
        contenedor.firstElementChild.appendChild(principal);
    }

    iniciar();

    return { iniciar: iniciar };
})();