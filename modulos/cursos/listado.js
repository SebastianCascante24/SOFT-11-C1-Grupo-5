
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const tabla = document.getElementById("tabla-cursos");
  const filtroCodigo = document.getElementById("filtro-codigo");
  const filtroNombre = document.getElementById("filtro-nombre");
  const filtroModalidad = document.getElementById("filtro-modalidad");
  const filtroEstado = document.getElementById("filtro-estado");
  const filtroCarrera = document.getElementById("filtro-carrera");
  const limpiarFiltros = document.getElementById("limpiar-filtros");
  const contador = document.getElementById("contador");
  const mensaje = document.getElementById("mensaje-listado");

  function leerDatos(clave) {
    try {
      const datos = JSON.parse(localStorage.getItem(clave) || "[]");
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }

  const cursos = leerDatos("cenfotec.hu44.cursos");
  
const cursos_normalizados = cursos.map(curso => ({
  ...curso,
  codigo: curso.code,
  nombre: curso.name,
  modalidad: curso.modality,
  estado: curso.status,
  carreraCodigo: curso.career
}));

  const carreras = leerDatos("grupo5_carreras");

  function normalizar(valor) {
    return String(valor ?? "").trim().toLocaleLowerCase("es");
  }

  // HU-23: Cargar las carreras registradas.
  carreras.forEach(carrera => {
    const opcion = document.createElement("option");
    opcion.value = carrera.codigo;
    opcion.textContent = `${carrera.nombre} (${carrera.codigo})`;
    filtroCarrera.appendChild(opcion);
  });

  function filtrarCursos() {
    const codigo = normalizar(filtroCodigo.value);
    const nombre = normalizar(filtroNombre.value);
    const modalidad = normalizar(filtroModalidad.value);
    const estado = normalizar(filtroEstado.value);
    const carreraSeleccionada = filtroCarrera.value;

    return cursos_normalizados.filter(curso => {
      const coincideCodigo =
        normalizar(curso.codigo).includes(codigo);

      const coincideNombre =
        normalizar(curso.nombre).includes(nombre);

      const coincideModalidad =
        !modalidad ||
        normalizar(curso.modalidad) === modalidad;

      const coincideEstado =
        !estado ||
        normalizar(curso.estado || "Borrador") === estado;

      // Se utiliza la asociación registrada en el curso.
      const coincideCarrera =
        !carreraSeleccionada ||
        String(curso.carreraCodigo ?? "") === carreraSeleccionada;

      return coincideCodigo &&
             coincideNombre &&
             coincideModalidad &&
             coincideEstado &&
             coincideCarrera;
    });
  }

  function crearCelda(valor) {
    const celda = document.createElement("td");
    celda.textContent = String(valor ?? "—");
    return celda;
  }

  function renderizarCursos() {
    const filtrados = filtrarCursos();
    tabla.replaceChildren();

    contador.textContent = `${filtrados.length} registro(s)`;

    if (filtrados.length === 0) {
      const fila = document.createElement("tr");
      const celda = document.createElement("td");

      celda.colSpan = 5;
      celda.textContent = cursos.length === 0
        ? "Todavía no hay cursos registrados."
        : "No hay cursos que coincidan con los filtros.";

      fila.appendChild(celda);
      tabla.appendChild(fila);
      return;
    }

    filtrados.forEach(curso => {
      const fila = document.createElement("tr");

      fila.appendChild(crearCelda(curso.codigo));
      fila.appendChild(crearCelda(curso.nombre));
      fila.appendChild(crearCelda(curso.modalidad));

      const celdaEstado = crearCelda(curso.estado || "Borrador");
      fila.appendChild(celdaEstado);

      const celdaAcciones = document.createElement("td");
      const enlace = document.createElement("a");

      enlace.href =
        "detalle.html?id=" +
        encodeURIComponent(curso.id ?? curso.code ?? curso.codigo ?? "");

      enlace.textContent = "Ver detalle";
      enlace.className = "boton-secundario";

      celdaAcciones.appendChild(enlace);
      fila.appendChild(celdaAcciones);

      tabla.appendChild(fila);
    });
  }

  [
    filtroCodigo,
    filtroNombre,
    filtroModalidad,
    filtroEstado,
    filtroCarrera
  ].forEach(control => {
    control.addEventListener("input", renderizarCursos);
    control.addEventListener("change", renderizarCursos);
  });

  limpiarFiltros.addEventListener("click", () => {
    filtroCodigo.value = "";
    filtroNombre.value = "";
    filtroModalidad.value = "";
    filtroEstado.value = "";
    filtroCarrera.value = "";

    mensaje.textContent = "";
    renderizarCursos();
  });

  renderizarCursos();
});
