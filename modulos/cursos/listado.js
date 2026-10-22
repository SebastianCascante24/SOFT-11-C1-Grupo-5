
document.addEventListener("DOMContentLoaded", () => {
    const tabla = document.getElementById("tablaCursos");
    const buscar = document.getElementById("buscar");
    const filtroEstado = document.getElementById("filtroEstado");
    const filtroModalidad = document.getElementById("filtroModalidad");
    const limpiarFiltros = document.getElementById("limpiarFiltros");
    const exportarCSV = document.getElementById("exportarCSV");
    const totalCursos = document.getElementById("totalCursos");
    const mensaje = document.getElementById("mensaje");

    function cargarCursos() {
        try {
            const datos = JSON.parse(localStorage.getItem("cursos") || "[]");
            return Array.isArray(datos) ? datos : [];
        } catch (error) {
            mostrarMensaje("No se pudieron leer los cursos guardados.", "error");
            return [];
        }
    }

    let cursos = cargarCursos();

    function normalizar(valor) {
        return String(valor ?? "")
            .trim()
            .toLocaleLowerCase("es");
    }

    function mostrarMensaje(texto, tipo = "info") {
        mensaje.textContent = texto;
        mensaje.className = texto ? `notice ${tipo}` : "";
    }

    function crearCelda(texto) {
        const celda = document.createElement("td");
        celda.textContent = texto || "—";
        return celda;
    }

    function obtenerCursosFiltrados() {
        const texto = normalizar(buscar.value);
        const estado = normalizar(filtroEstado.value);
        const modalidad = normalizar(filtroModalidad.value);

        return cursos.filter(curso => {
            const coincideTexto =
                normalizar(curso.codigo).includes(texto) ||
                normalizar(curso.nombre).includes(texto);

            const coincideEstado =
                !estado || normalizar(curso.estado) === estado;

            const coincideModalidad =
                !modalidad || normalizar(curso.modalidad) === modalidad;

            return coincideTexto && coincideEstado && coincideModalidad;
        });
    }

    function crearEnlaceDetalle(curso) {
        const enlace = document.createElement("a");
        const identificador = curso.id ?? curso.codigo;

        enlace.href = `detalle.html?id=${encodeURIComponent(identificador ?? "")}`;
        enlace.textContent = "Ver detalle";
        enlace.setAttribute(
            "aria-label",
            `Ver detalle del curso ${curso.nombre || curso.codigo || ""}`
        );

        return enlace;
    }

    function renderizarCursos() {
        const filtrados = obtenerCursosFiltrados();
        tabla.replaceChildren();

        totalCursos.textContent =
            `${filtrados.length} curso(s) encontrado(s)`;

        if (filtrados.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");

            celda.colSpan = 6;
            celda.className = "empty-state";
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
            fila.appendChild(crearCelda(curso.creditos));

            const celdaEstado = document.createElement("td");
            const etiquetaEstado = document.createElement("span");
            const estado = curso.estado || "Borrador";

            etiquetaEstado.textContent = estado;
            etiquetaEstado.className = "estado";

            const estadoNormalizado = normalizar(estado);
            if (estadoNormalizado === "borrador") {
                etiquetaEstado.classList.add("borrador");
            } else if (estadoNormalizado === "aprobado") {
                etiquetaEstado.classList.add("aprobado");
            }

            celdaEstado.appendChild(etiquetaEstado);
            fila.appendChild(celdaEstado);

            const celdaAcciones = document.createElement("td");
            celdaAcciones.appendChild(crearEnlaceDetalle(curso));
            fila.appendChild(celdaAcciones);

            tabla.appendChild(fila);
        });
    }

    [buscar, filtroEstado, filtroModalidad].forEach(control => {
        control.addEventListener("input", renderizarCursos);
        control.addEventListener("change", renderizarCursos);
    });

    limpiarFiltros.addEventListener("click", () => {
        buscar.value = "";
        filtroEstado.value = "";
        filtroModalidad.value = "";
        mostrarMensaje("");
        renderizarCursos();
    });

    exportarCSV.addEventListener("click", () => {
        const filtrados = obtenerCursosFiltrados();

        if (filtrados.length === 0) {
            mostrarMensaje("No hay cursos para exportar.", "info");
            return;
        }

        const columnas = [
            ["Código", "codigo"],
            ["Nombre", "nombre"],
            ["Modalidad", "modalidad"],
            ["Créditos", "creditos"],
            ["Estado", "estado"]
        ];

        const escaparCSV = valor =>
            `"${String(valor ?? "").replace(/"/g, '""')}"`;

        const contenido = [
            columnas.map(([titulo]) => escaparCSV(titulo)).join(";"),
            ...filtrados.map(curso =>
                columnas
                    .map(([, campo]) => escaparCSV(curso[campo]))
                    .join(";")
            )
        ].join("\r\n");

        const archivo = new Blob(
            ["\uFEFF" + contenido],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement("a");

        enlace.href = url;
        enlace.download = "listado-cursos.csv";
        enlace.click();

        URL.revokeObjectURL(url);
        mostrarMensaje("Se generó el archivo CSV.", "success");
    });

    renderizarCursos();
});
