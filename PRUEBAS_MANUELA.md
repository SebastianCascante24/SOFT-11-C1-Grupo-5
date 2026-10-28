# Pruebas de las historias de usuario (prototipo local)

**Solo para datos ficticios.** El almacenamiento y la sesión del navegador no ofrecen autenticación ni autorización segura. No usar con cuentas reales.

1. Abrir con Live Server en `http://127.0.0.1:3000/` (mantener siempre el mismo origen).
2. Si ya había un usuario antiguo sin credencial: en el login ingresar su correo y una contraseña ficticia de 8–15 caracteres (mayúscula, minúscula, número y símbolo); pulsar **Activar cuenta antigua** y luego **Iniciar**. La activación es una función de migración *solo para demostración* y no verifica identidad.
3. Si el navegador no tiene usuarios, registrar primero un usuario ficticio en `modulos/usuarios/usuario-registro.html` o `modulos/usuarios/registro.html` con rol admin; después iniciar sesión.
4. HU-09: `modulos/usuarios/listado.html` → Editar → Guardar; verificar cambios al volver a la lista.
5. HU-04 y HU-03: `modulos/usuarios/perfil.html` → revisar datos y cambiar avatar; recargar y comprobar persistencia.
6. HU-15: `modulos/escuelas/listado.html` → consultar escuelas registradas.
7. HU-18: crear escuela, registrar un usuario con rol `dir`, abrir `modulos/carreras/formulario.html`, crear carrera con código único.
8. HU-19: elegir director al crear carrera; en `modulos/carreras/listado.html`, probar Cambiar director y verificar persistencia.

**Limitaciones:** Las contraseñas se simulan con huellas SHA-256 sin sal en localStorage, lo cual no es seguro; los roles son manipulables en el navegador. Para producción se requiere backend, hashes adaptativos y autorización en servidor. La activación de cuentas antiguas debe eliminarse antes de cualquier despliegue real. Los datos de `localStorage` del navegador original no viajan dentro del ZIP.
