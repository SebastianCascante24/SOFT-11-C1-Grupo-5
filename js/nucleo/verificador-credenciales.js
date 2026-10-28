
/*
 * Verificación de credenciales.
 * Prototipo académico: HTML, CSS, JS y localStorage.
 *
 * No proporciona autenticación segura para producción.
 */
const VerificadorCredenciales = {
    clave: "grupo5_credenciales_demo",

    async generarHuella(correo, contrasena) {
        const datos = new TextEncoder().encode(
            correo.trim().toLowerCase() + ":" + contrasena
        );

        const resultado = await crypto.subtle.digest("SHA-256", datos);

        return Array.from(new Uint8Array(resultado))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    },

    async registrar(correo, contrasena) {
        const identificador = correo.trim().toLowerCase();
        const huella = await this.generarHuella(
            identificador,
            contrasena
        );

        const credenciales = JSON.parse(
            localStorage.getItem(this.clave) || "{}"
        );

        credenciales[identificador] = huella;

        localStorage.setItem(
            this.clave,
            JSON.stringify(credenciales)
        );

        return true;
    },

    async verificar(correo, contrasena) {
        const identificador = correo.trim().toLowerCase();

        const credenciales = JSON.parse(
            localStorage.getItem(this.clave) || "{}"
        );

        const huellaGuardada = credenciales[identificador];

        if (!huellaGuardada) {
            return false;
        }

        const huellaIngresada = await this.generarHuella(
            identificador,
            contrasena
        );

        return huellaGuardada === huellaIngresada;
    }
};
