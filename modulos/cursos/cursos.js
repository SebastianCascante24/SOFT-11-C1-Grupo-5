// HU-44 · Comportamiento y validación de registro de cursos.
// En esta iteración se utiliza almacenamiento local del navegador, sin conexión a MongoDB.
(() => {
  const form = document.getElementById("courseForm");
  const message = document.getElementById("globalMessage");
  const draftKey = "cenfotec.hu44.cursos";
  const courseCode = document.getElementById("code");
  const courseName = document.getElementById("name");

  const get = (id) => document.getElementById(id);
  const value = (id) => get(id).value.trim();

  function showMessage(text, type = "info") {
    message.textContent = text;
    message.className = `notice ${type}`;
    message.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "notice hidden";
  }

  function setError(id, text) {
    const element = get(id);
    const field = element.closest(".field");
    if (!field) return;
    field.classList.toggle("invalid", Boolean(text));
    const error = field.querySelector(".error-text");
    if (error) error.textContent = text || "";
    element.setAttribute("aria-invalid", text ? "true" : "false");
  }

  function clearErrors() {
    form.querySelectorAll(".field").forEach(field => {
      field.classList.remove("invalid");
      const error = field.querySelector(".error-text");
      if (error) error.textContent = "";
      const control = field.querySelector("input, select, textarea");
      if (control) control.setAttribute("aria-invalid", "false");
    });
  }

  function validateField(id, mode) {
    const el = get(id);
    const v = el.value.trim();
    let error = "";
    const required = mode === "submit" ||
      (mode === "draft" && ["school", "code", "name"].includes(id));

    if (required && !v) {
      const labels = {
        school: "Seleccione la escuela.", career: "Seleccione una carrera de la escuela.",
        code: "Ingrese el código del curso.", name: "Ingrese el nombre del curso.",
        powerName: "Ingrese el nombre en Power Accounts.", ecommerce: "Seleccione una opción.",
        currency: "Seleccione la moneda.", sfia: "Seleccione un área SFIA.", topic: "Seleccione una temática.",
        credits: "Ingrese un número de créditos válido.", classHours: "Ingrese un número de horas válido.",
        extraHours: "Ingrese un número de horas válido.", modality: "Seleccione la modalidad.",
        complexity: "Seleccione el nivel de complejidad.", requirements: "Ingrese los requisitos o indique «Ninguno».",
        shortDescription: "Ingrese la descripción corta del curso.", metaDescription: "Ingrese la meta descripción del curso.",
        longDescription: "Ingrese la descripción larga del curso.", capabilities: "Complete las capacidades específicas.",
        keywords: "Ingrese mínimo una palabra clave válida.", metadata: "Ingrese la metadata del curso."
      };
      error = labels[id] || "Complete este campo.";
    }

    if (!error && id === "code" && v) {
      if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,29}$/.test(v)) {
        error = "Use entre 2 y 30 caracteres: letras, números, punto, guion o guion bajo.";
      } else {
        const saved = JSON.parse(localStorage.getItem(draftKey) || "[]");
        const exists = saved.some(course =>
          String(course.code).toLowerCase() === v.toLowerCase() &&
          course.code !== (get("editingCode")?.value || "")
        );
        if (exists) error = "El código ya existe en los registros locales.";
      }
    }
    if (!error && id === "name" && v.length > 0 && (v.length < 3 || v.length > 150)) {
      error = "El nombre del curso debe tener entre 3 y 150 caracteres.";
    }
    if (!error && id === "powerName" && v.length > 40) error = "Máximo 40 caracteres.";
    if (!error && ["credits", "classHours", "extraHours"].includes(id) && v) {
      const n = Number(v);
      if (!Number.isInteger(n) || n < (id === "credits" ? 1 : 0)) {
        error = id === "credits" ? "Los créditos deben ser un entero mayor o igual a 1." : "Ingrese un entero mayor o igual a 0.";
      }
    }
    if (!error && id === "program" && v.length > 100) error = "El programa no puede superar 100 caracteres.";
    if (!error && id === "shortDescription" && v.length > 250) error = "Máximo 250 caracteres.";
    if (!error && id === "metaDescription" && v.length > 150) error = "Máximo 150 caracteres.";
    if (!error && id === "openingDate" && get("ecommerce").value === "Sí" && mode === "submit" && !v) {
      error = "Ingrese la fecha de apertura.";
    }
    if (!error && id === "openingDate" && v && get("ecommerce").value === "Sí") {
      const selected = new Date(`${v}T00:00:00`);
      if (Number.isNaN(selected.getTime())) error = "Ingrese una fecha válida.";
    }
    if (!error && id === "certifier" && get("certification").value === "Sí" && mode === "submit" && !v) {
      error = "Seleccione la casa certificadora.";
    }
    if (!error && id === "keywords" && mode === "submit" && v) {
      const words = v.split(",").map(s => s.trim()).filter(Boolean);
      if (!words.length || words.some(word => word.length < 2 || word.length > 30)) {
        error = "Cada palabra clave debe tener entre 2 y 30 caracteres.";
      }
    }
    setError(id, error);
    return !error;
  }

  function validate(mode) {
    clearErrors();
    const ids = [
      "school", "career", "code", "name", "powerName", "ecommerce", "openingDate", "currency",
      "sfia", "topic", "credits", "classHours", "extraHours", "modality", "complexity",
      "requirements", "program", "shortDescription", "metaDescription", "longDescription",
      "capabilities", "keywords", "certifier", "metadata"
    ];
    let valid = true;
    ids.forEach(id => {
      const el = get(id);
      if (el) valid = validateField(id, mode) && valid;
    });
    if (!valid) {
      showMessage(mode === "draft"
        ? "Revise los datos señalados. Para guardar un borrador debe ingresar escuela, código y nombre válidos."
        : "Hay datos que necesitan revisión. Complete los campos indicados antes de enviar el curso.", "error");
      const first = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
      if (first) first.focus({ preventScroll: false });
    }
    return valid;
  }

  function collectCourse(status) {
    const data = Object.fromEntries(new FormData(form).entries());
    data.code = data.code.trim();
    data.name = data.name.trim();
    data.totalHours = Number(data.classHours || 0) + Number(data.extraHours || 0);
    data.keywords = (data.keywords || "").split(",").map(s => s.trim()).filter(Boolean);
    data.status = status;
    data.updatedAt = new Date().toISOString();
    return data;
  }

  function save(status) {
    const valid = validate(status === "draft" ? "draft" : "submit");
    if (!valid) return;
    const course = collectCourse(status);
    const courses = JSON.parse(localStorage.getItem(draftKey) || "[]");
    const existingIndex = courses.findIndex(c => String(c.code).toLowerCase() === course.code.toLowerCase());
    if (existingIndex >= 0) courses[existingIndex] = course;
    else courses.push(course);
    localStorage.setItem(draftKey, JSON.stringify(courses));
    if (status === "Borrador") {
      showMessage(`Borrador del curso "${course.name}" guardado en este navegador.`, "success");
    } else {
      showMessage(`El curso "${course.name}" quedó registrado localmente con estado "Pendiente de revisión". Esta demostración no envía datos a un servidor.`, "success");
    }
  }

  function updateTotal() {
    const classHours = Number(get("classHours").value || 0);
    const extraHours = Number(get("extraHours").value || 0);
    get("totalHours").value = classHours + extraHours;
  }

  function updateConditionalFields() {
    const ecommerce = get("ecommerce").value === "Sí";
    get("openingDateField").style.display = ecommerce ? "" : "none";
    if (!ecommerce) setError("openingDate", "");
    const certification = get("certification").value === "Sí";
    get("certifierField").style.display = certification ? "" : "none";
    if (!certification) setError("certifier", "");
  }

  function updateCounters() {
    get("shortCount").textContent = get("shortDescription").value.length;
    get("metaCount").textContent = get("metaDescription").value.length;
  }

  function updateProgress() {
    const fields = ["school", "career", "code", "name", "sfia", "topic", "credits", "classHours", "extraHours", "modality"];
    const filled = fields.filter(id => value(id) !== "").length;
    const percent = Math.round(filled / fields.length * 100);
    get("completionBar").style.width = `${percent}%`;
    get("completionText").textContent = `${percent}% completado`;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    save("Pendiente de revisión");
  });
  get("draftBtn").addEventListener("click", () => save("Borrador"));
  get("cancelBtn").addEventListener("click", () => {
    if (formHasData() && !window.confirm("¿Desea cancelar? Los cambios no guardados se perderán.")) return;
    form.reset();
    clearErrors();
    clearMessage();
    updateTotal();
    updateConditionalFields();
    updateCounters();
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function formHasData() {
    return [...form.querySelectorAll("input:not([readonly]), select, textarea")]
      .some(el => el.value.trim() !== "" && !["classHours", "extraHours"].includes(el.id));
  }

  form.querySelectorAll("input, select, textarea").forEach(el => {
    el.addEventListener("blur", () => {
      if (el.id && el.id !== "totalHours" && el.id !== "desirable" && el.id !== "competencies" &&
          el.id !== "entryProfile" && el.id !== "exitProfile" && el.id !== "certification") {
        validateField(el.id, "blur");
      }
    });
    el.addEventListener("input", () => {
      clearMessage();
      if (el.id === "classHours" || el.id === "extraHours") updateTotal();
      if (el.id === "shortDescription" || el.id === "metaDescription") updateCounters();
      updateProgress();
    });
    el.addEventListener("change", () => {
      if (el.id === "ecommerce" || el.id === "certification") updateConditionalFields();
      updateProgress();
    });
  });

  // Inicialización: los catálogos son ejemplos para maquetación; deberán conectarse a los catálogos reales.
  updateTotal();
  updateConditionalFields();
  updateCounters();
  updateProgress();
})();
