const parametros = new URLSearchParams(window.location.search);
const idBuscado = parametros.get("id");

function obtenerCursos() {
    try {
        const datos = JSON.parse(localStorage.getItem("cursos") || "[]");
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function mostrar(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return "No registrado";
    }

    if (Array.isArray(valor)) {
        return valor.length ? valor.join(", ") : "No registrado";
    }

    return String(valor);
}

function asignar(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = mostrar(valor);
    }
}

const cursos = obtenerCursos();

const curso = cursos.find(item =>
    String(item.id ?? item.codigo) === String(idBuscado)
);

if (!curso) {
    document.getElementById("mensaje").textContent =
        "No se encontró el curso. Puede que no exista o que el enlace sea incorrecto.";

    document.getElementById("editar").disabled = true;
} else {
    asignar("codigo", curso.codigo);
    asignar("nombre", curso.nombre);
    asignar("nombrePower", curso.nombrePower ?? curso.nombrePowerAccounts);
    asignar("escuela", curso.escuela);
    asignar("carrera", curso.carrera);
    asignar("estado", curso.estado);
    asignar("fechaModificacion", curso.fechaModificacion ?? curso.ultimaModificacion);

    asignar("modalidad", curso.modalidad);
    asignar("creditos", curso.creditos);
    asignar("horasClase", curso.horasClase);
    asignar("horasExtraclase", curso.horasExtraclase);
    asignar("totalHoras", curso.totalHoras);
    asignar("requisitosIndispensables", curso.requisitosIndispensables);
    asignar("requisitosDeseables", curso.requisitosDeseables);

    asignar("ecommerce", curso.ecommerce);
    asignar("fechaApertura", curso.fechaApertura);
    asignar("moneda", curso.moneda);
    asignar("programa", curso.programa);

    asignar("descripcionCorta", curso.descripcionCorta);
    asignar("descripcionCompleta", curso.descripcionCompleta ?? curso.descripcion);
    
    document.getElementById("editar").addEventListener("click", () => {
        window.location.href =
            `registro.html?id=${encodeURIComponent(curso.id ?? curso.codigo)}`;
    });
}

