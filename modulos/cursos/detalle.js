
const parametros = new URLSearchParams(window.location.search);
const idBuscado = parametros.get("id");

function leerDatos(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave) || "[]");
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

function buscarNombre(registros, codigo) {
  const registro = registros.find(item =>
    String(item.codigo) === String(codigo)
  );

  return registro?.nombre ?? codigo;
}

const cursos = leerDatos("cenfotec.hu44.cursos");
const escuelas = leerDatos("grupo5_escuelas");
const carreras = leerDatos("grupo5_carreras");

const curso = cursos.find(item =>
  String(item.id ?? item.code ?? item.codigo) === String(idBuscado)
);

const botonEditar = document.getElementById("editar");
const mensaje = document.getElementById("mensaje");

if (!curso) {
  if (mensaje) {
    mensaje.textContent =
      "No se encontró el curso. Verifique el enlace o el registro.";
  }

  if (botonEditar) {
  botonEditar.disabled = false;
  botonEditar.addEventListener("click", () => {
    const codigo = curso.code ?? curso.codigo;
    window.location.href =
      `registro.html?id=${encodeURIComponent(codigo)}`;
  });
}
} else {
  asignar("codigo", curso.code ?? curso.codigo);
  asignar("nombre", curso.name ?? curso.nombre);
  asignar(
    "nombrePower",
    curso.powerName ?? curso.nombrePower ?? curso.nombrePowerAccounts
  );

  asignar(
    "escuela",
    buscarNombre(escuelas, curso.school ?? curso.escuela)
  );

  asignar(
    "carrera",
    buscarNombre(carreras, curso.career ?? curso.carrera)
  );

  asignar("estado", curso.status ?? curso.estado);

  asignar(
    "fechaModificacion",
    curso.updatedAt ?? curso.fechaModificacion ?? curso.ultimaModificacion
  );

  asignar("modalidad", curso.modality ?? curso.modalidad);
  asignar("creditos", curso.credits ?? curso.creditos);
  asignar("horasClase", curso.classHours ?? curso.horasClase);
  asignar("horasExtraclase", curso.extraHours ?? curso.horasExtraclase);
  asignar("totalHoras", curso.totalHours ?? curso.totalHoras);

  asignar(
    "requisitosIndispensables",
    curso.requirements ?? curso.requisitosIndispensables
  );

  asignar("requisitosDeseables", curso.requisitosDeseables);

  asignar("ecommerce", curso.ecommerce);
  asignar("fechaApertura", curso.openingDate ?? curso.fechaApertura);
  asignar("moneda", curso.currency ?? curso.moneda);
  asignar("programa", curso.program ?? curso.programa);

  asignar(
    "descripcionCorta",
    curso.shortDescription ?? curso.descripcionCorta
  );

  asignar(
    "descripcionCompleta",
    curso.longDescription ?? curso.descripcionCompleta ?? curso.descripcion
  );

   if (botonEditar) {
  if (curso && (curso.code || curso.codigo)) {
    // El curso existe: permitir editarlo.
    botonEditar.disabled = false;
    botonEditar.removeAttribute("title");

    botonEditar.addEventListener("click", () => {
      const codigo = curso.code ?? curso.codigo;

      window.location.href =
        `registro.html?id=${encodeURIComponent(codigo)}`;
    });
  } else {
    // El curso no existe: impedir la edición.
    botonEditar.disabled = true;
    botonEditar.title = "No se puede editar un curso que no existe";
  }
}
}