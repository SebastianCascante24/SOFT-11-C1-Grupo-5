
const CLAVE_CURSOS = "cursos";
const tabla = document.getElementById("tabla-cursos");

function obtenerCursos() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE_CURSOS) || "[]");
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function mostrarCursos() {
    const cursos = obtenerCursos();

    const codigo = document.getElementById("filtro-codigo").value.toLowerCase();
    const nombre = document.getElementById("filtro-nombre").value.toLowerCase();
    const modalidad = document.getElementById("filtro-modalidad").value;
    const estado = document.getElementById("filtro-estado").value;

    const filtrados = cursos.filter(curso =>
        String(curso.codigo || "").toLowerCase().includes(codigo) &&
        String(curso.nombre || "").toLowerCase().includes(nombre) &&
        (!modalidad || curso.modalidad === modalidad) &&
        (!estado || curso.estado === estado)
    );

    document.getElementById("contador").textContent =
        `${filtrados.length} registros`;

    tabla.replaceChildren();

    if (filtrados.length === 0) {
        const fila = tabla.insertRow();
        const celda = fila.insertCell();
        celda.colSpan = 5;
        celda.textContent = "Aún no hay registros en este catálogo.";
        return;
    }

    filtrados.forEach(curso => {
        const fila = tabla.insertRow();

        [curso.codigo, curso.nombre, curso.modalidad, curso.estado]
            .forEach(valor => {
                const celda = fila.insertCell();
                celda.textContent = valor || "—";
            });

        const acciones = fila.insertCell();
        const editar = document.createElement("a");
        editar.href = `registro.html?id=${encodeURIComponent(curso.id || curso.codigo || "")}`;
        editar.textContent = "Editar";
        acciones.appendChild(editar);
    });
}

["filtro-codigo", "filtro-nombre", "filtro-modalidad", "filtro-estado"]
    .forEach(id => {
        document.getElementById(id).addEventListener("input", mostrarCursos);
        document.getElementById(id).addEventListener("change", mostrarCursos);
    });

document.getElementById("limpiar-filtros").addEventListener("click", () => {
    document.getElementById("filtro-codigo").value = "";
    document.getElementById("filtro-nombre").value = "";
    document.getElementById("filtro-modalidad").value = "";
    document.getElementById("filtro-estado").value = "";
    mostrarCursos();
});

document.getElementById("exportar-csv").addEventListener("click", () => {
    const cursos = obtenerCursos();
    const columnas = ["codigo", "nombre", "modalidad", "estado"];

    const escapar = valor =>
        `"${String(valor ?? "").replace(/"/g, '""')}"`;

    const csv = [
        columnas.join(";"),
        ...cursos.map(curso =>
            columnas.map(columna => escapar(curso[columna])).join(";")
        )
    ].join("\n");

    const archivo = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = "cursos.csv";
    enlace.click();
    URL.revokeObjectURL(enlace.href);
});

mostrarCursos();
