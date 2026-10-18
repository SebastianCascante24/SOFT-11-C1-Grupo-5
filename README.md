# SOFT-11-C1-Grupo-5
Proyecto Integrador 1 - Sistema de gestion para el departamento de desarrollo curricular y docente

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