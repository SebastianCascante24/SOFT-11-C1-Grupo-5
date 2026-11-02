# SOFT-11-C1-Grupo-5

Proyecto Integrador 1 · Sistema de gestión para el Departamento de Desarrollo Curricular y Docente de la Universidad CENFOTEC.
 
## Objetivo
 
Centralizar en un sistema propio el registro, la validación y la consulta de los cursos de la universidad, reemplazando el uso de hojas de Excel y formularios de Google. El sistema busca:
 
- Eliminar la duplicidad de códigos de curso mediante validación automática al registrar.
- Reducir el tiempo de aprobación de un curso, con una bandeja de revisión para Desarrollo Curricular.
- Permitir a los directores ingresar un curso por etapas, guardándolo como borrador aunque falte información.
## Funcionalidades
 
- **Inicio y cierre de sesión:** el acceso se valida contra los usuarios registrados. Las páginas del sistema solo se muestran con una sesión iniciada.
- **Usuarios:** registro y listado de usuarios.
- **Escuelas y carreras:** formulario y listado.
- **Cursos:** formulario de registro (con borrador o envío a revisión), listado y detalle del curso.
- **Catálogos:** áreas SFIA, temáticas, metodologías de aprendizaje, casas certificadoras y niveles de complejidad, con listado (filtros y paginación), creación y modificación de registros.
- **Revisión de cursos:** bandeja de cursos pendientes y pantalla de revisión para aprobar un curso o devolverlo con observaciones obligatorias.
## Tecnologías
 
- HTML5 y CSS3.
- JavaScript (ES6+) sin frameworks ni librerías externas; scripts normales, sin módulos ni empaquetador.
- Local Storage del navegador para guardar los datos y la sesión; el proyecto no tiene servidor ni base de datos.
- Git y GitHub para el control de versiones.
## Preparación
 
No hay nada que instalar ni compilar.
 
1. Tener un navegador actualizado (Chrome, Edge o Firefox).
2. Clonar el repositorio: `git clone https://github.com/SebastianCascante24/SOFT-11-C1-Grupo-5.git`

## Ejecución
 
1. Abrir `modulos/autenticacion/login.html` en el navegador (con el servidor local: `http://localhost:8000/modulos/autenticacion/login.html`).
2. **Crear el primer usuario.** La página de registro de usuarios también exige sesión, y el login solo acepta usuarios registrados. Con el login abierto, abrir la consola del navegador (F12) y pegar:
```javascript
localStorage.setItem('grupo5_usuarios', JSON.stringify([{id: crypto.randomUUID(), nombre: 'Administrador', correo: 'admin@cenfotec.ac.cr',nacimiento: '', genero: '', rol: 'admin', fechaRegistro: new Date().toISOString()}]));
```
 
3. Iniciar sesión con `admin@cenfotec.ac.cr` y cualquier contraseña (en esta iteración la contraseña es obligatoria pero no se compara). Desde ahí se navega con el menú lateral.

```

Los datos viven en el Local Storage de cada navegador; borrarlo elimina los usuarios, cursos y catálogos guardados.
 
## Estructura del proyecto
 
```
SOFT-11-C1-Grupo-5/
├── index.html                 Inicio
├── css/
│   ├── base/                  Variables, reset y tipografía
│   ├── layout/                Encabezado, menú lateral y grid
│   └── componentes/           Botones, formularios, tablas, tarjetas y alertas
├── js/
│   ├── nucleo/                Almacenamiento, enrutador y autenticación
│   ├── utilidades/            Validadores y formateadores
│   └── componentes/           Notificaciones y modal
├── modulos/
│   ├── autenticacion/         Inicio de sesión
│   ├── usuarios/              Registro y listado de usuarios
│   ├── escuelas/              Formulario y listado
│   ├── carreras/              Formulario y listado
│   ├── cursos/                Registro, listado y detalle
│   ├── catalogos/             Listado, creación y modificación de catálogos
│   └── revision/              Cursos pendientes y revisión
└── Documentos/                ERS y documento de diseño
```
 
## Equipo
 
- Sebastián Cascante Badilla (Soporte Técnico)
- Santiago Martínez Ramírez (Coordinador)
- Manuela Arce Elizondo (Calidad)
**Institución:** Universidad CENFOTEC
**Curso:** SOFT-11-C1, Grupo 5
**Profesor:** Álvaro Cordero Peña
**Período lectivo:** C3/2026
 
## Estado del producto
 
Prototipo funcional de la primera iteración.
 
**Implementado:** inicio y cierre de sesión con protección de páginas, catálogos (listado, creación y modificación), formulario, listado y detalle de cursos, y revisión de cursos (aprobar o devolver con observaciones).
 
**Pendiente o limitado en esta iteración:**
 
- La contraseña no se compara: el registro de usuarios todavía no la guarda.
- «Iniciar con Google» y «¿Olvidó su contraseña?» son solo visuales.
- Activar y desactivar registros de catálogo desde el listado.
- Notificaciones a los roles involucrados y persistencia en un servidor.
- La revisión lee los cursos de la clave `cenfotec.hu44.cursos` con `status` igual a `en revision`; la integración con el formulario de registro de cursos está pendiente.

## JavaScript reutilizables

Los archivos de **js/nucleo**, **js/utilidades** y **js/componentes** los puede usar cualquier pagina, **NO MODIFICAR**: si hace falta algo nuevo, lo agregan y me avisan (Sebastian) o abren el PR, como prefieran, todo lo que sea propio de un modulo va en el js de ese modulo

Son scripts normales, no modulos no tienen que importar o exportar nada

### Como usarlos/llamarlos

Se cargan como DOM normales, y el JS del modulo va siempre de ultimo, el orden entre ellos no importa siempre y cuando el js del modulo vaya de **ULTIMO**, Pueden cargarlos todos de una vez o los van agregando conforme los necesiten

```html
<script src="../../js/nucleo/almacenamiento.js"></script>
<script src="../../js/nucleo/enrutador.js"></script>
<script src="../../js/utilidades/validadores.js"></script>
<script src="../../js/utilidades/formateadores.js"></script>
<script src="../../js/componentes/notificacion.js"></script>
<script src="../../js/componentes/modal.js"></script>
<script src="catalogos.js"></script>
```

Los nombres de los objetos globales son **Almacenamiento**, **Enrutador**, **Validadores**, **Formateadores**, **Notificacion** y **Modal**, no se debe declarar otra variable con esos nombres en ningun otro archivo, porque puede chocar

### Almacenamiento (js/nucleo/almacenamiento.js)

Lee y escribe en localstorage guarda JSONs, no pertenece a ningun modulo, solo recibe una clave y un valor - ver catalogos.js para referencia de uso

```javascript
Almacenamiento.obtener(clave, valorPorDefecto = null)
Almacenamiento.guardar(clave, valor)
```

**obtener** devuelve el valor guardado, o **valorPorDefecto** si la clave no existe o no se pudo leer, **guardar** devuelve **true** si funciona y **false** si falla, y en ese caso dejan el error en la consola, en localstorage no existe modificar, para cambiar parte de un valor se lee, se cambia y se vuelve a guardar completo con **guardar**

ejemplo de uso - para ver como lo implemente yo pueden ver catalogos.js
```javascript
const registros = Almacenamiento.obtener('catalogo_areas-sfia', []);
registros.push({ codigo: 1, nombre: 'Ejemplo', activo: true });
if (!Almacenamiento.guardar('catalogo_areas-sfia', registros)) {
  // avisar que no se pudo guardar
}
```

Las claves de cada modulo deben llevar un prefijo propio para no chocar con las de otros modulos - ejemplo: catalogo_areas-sfia siendo catalogo el prefijo y area-sfia el modulo

### Enrutador (js/nucleo/enrutador.js)

Lee los parametros de la URL y navega

```javascript
Enrutador.obtenerParametro(nombre)
Enrutador.irA(ruta)
```

**obtenerParametro** devuelve el texto del parametro, o **null** si no viene en la URL, **irA** cambia de pagina, la ruta es relativa a la pagina actual

```javascript
// URL: formulario.html?catalogo=areas-sfia&codigo=7
const idCatalogo = Enrutador.obtenerParametro('catalogo');   // 'areas-sfia'
const codigo = Enrutador.obtenerParametro('codigo');         // '7'
const otro = Enrutador.obtenerParametro('otro');             // null

Enrutador.irA('listado.html?catalogo=areas-sfia');
```

Todo valor que llegue por la URL hay que validarlo antes de usarlo, no se debe asumir que es correcto - para mas referencia de como lo use vean catalogos.js

### Validadores (js/utilidades/validadores.js)

Reglas genericas que devuelven **true** o **false**, no muestran mensajes ni saben que campo se esta validando, el texto del error y la decision de que regla aplica a cada campo van en el JS de cada modulo

```javascript
Validadores.estaVacio(valor)                  // vacio, null, undefined o solo espacios
Validadores.tieneLongitudMinima(valor, minimo)
Validadores.superaLongitudMaxima(valor, maximo)
Validadores.esEnteroPositivo(valor)           // solo digitos y mayor que 0
```

Todas ignoran los espacios al inicio y al final del texto - ejemplo:

```javascript
if (Validadores.estaVacio(campo.value)) {
  // mensaje: 'Ingrese el nombre.'
} else if (!Validadores.tieneLongitudMinima(campo.value, 3)) {
  // mensaje: 'El nombre debe tener al menos 3 caracteres.'
}
```

### Formateadores (js/utilidades/formateadores.js)

Normalizador para el texto

```javascript
Formateadores.normalizarTexto(texto)
```

Devuelve el texto sin espacios en los extremos, en minusculas y sin tildes, sirve para comparar y filtrar: "Gestión" y "gestion" serian un match

```javascript
const coincide = Formateadores.normalizarTexto(registro.nombre)
  .includes(Formateadores.normalizarTexto(textoBuscado));
```
**ver catalogos.js para mas referencia**

### Notificacion (js/componentes/notificacion.js)

Muestra mensajes, no valida nada y no depende de otros archivos, solo muestra el texto que le pasen

```javascript
Notificacion.mostrar(tipo, mensaje, duracion = 4000)
Notificacion.mostrarErrorCampo(campo, mensaje)
Notificacion.limpiarErrorCampo(campo)
Notificacion.mostrarErrorGeneral(contenedor, mensaje)
Notificacion.limpiarErrorGeneral(contenedor)
```

Aviso temporal, **tipo** es **'exito'**, **'error'**, **'advertencia'** o **'info'**, aparece flotando y desaparece solo despues de **duracion** en milisegundos, no necesita nada en el HTML, el contenedor se crea la primera vez que se usa - ejemplo:

```javascript
Notificacion.mostrar('exito', 'Registro guardado correctamente.');
```

Error debajo de un campo, el campo necesita un **id** y debe estar dentro de un contenedor **.campo**, porque el mensaje se inserta como el elemento siguiente al campo, con el id `error-<id del campo>`

```html
<div class="campo">
  <label for="mi-codigo">Codigo</label>
  <input type="text" id="mi-codigo" name="codigo">
</div>
```

```javascript
const campo = document.getElementById('mi-codigo');
Notificacion.mostrarErrorCampo(campo, 'Ingrese el codigo.');
Notificacion.limpiarErrorCampo(campo);
```

mensaje general del formulario, necesita un elemento que ya exista en el HTML, oculto al inicio, dentro del formulario y arriba de los campos, a los metodos se les pasa el elemento, no el id, el mensaje se queda hasta que se limpie - ejemplo:

```html
<div id="mi-error-general" class="alerta alerta-error" role="alert" hidden></div>
```

```javascript
const errorGeneral = document.getElementById('mi-error-general');
Notificacion.mostrarErrorGeneral(errorGeneral, 'Hay datos que necesitan revision.');
Notificacion.limpiarErrorGeneral(errorGeneral);
```

El `<form>` debe llevar el atributo **novalidate**, para que el navegador no muestre sus propios mensajes antes que estos

Los estilos que usa (en **alertas.css** y **formularios.css**): **.alerta**, **.alerta-error**, **.alerta-exito**, **.alerta-advertencia**, **.alerta-info**, **.mensaje-error**, el contenedor **#contenedor-notificaciones** y **input[aria-invalid="true"]**

Uso en un formulario: al salir de un campo se valida con **Validadores** y se llama a **mostrarErrorCampo** o **limpiarErrorCampo**, al enviar, si algun campo falla, se llama a **mostrarErrorGeneral** y se manda el foco al primer campo invalido, si todo esta bien y se guarda, **mostrar('exito', ...)**, un fallo del sistema al guardar se avisa con **mostrar('error', ...)**, no con el mensaje general

### Modal (js/componentes/modal.js)

Ventana de confirmacion, no necesita nada en el HTML, se crea con js al usarla y se elimina al cerrarse

```javascript
Modal.confirmar({ titulo, mensaje, textoConfirmar = 'Aceptar', textoCancelar = 'Cancelar' })
```

Devuelve true si se confirma y false si se cancela o cierra con esc, el focus empieza en el boton de cancelar

```javascript
const confirmado = await Modal.confirmar({
  titulo: 'Desactivar registro',
  mensaje: '¿Desactivar este registro?',
  textoConfirmar: 'Desactivar'
});
if (!confirmado) return;
```

**IMPORTANTE:**
La funcion que la use tiene que ser **async** para poder usar **await**, los estilos estan en **alertas.css**: **.modal**, **.modal::backdrop**, **.modal-acciones**, el boton de cancelar lleva la clase **boton-secundario**