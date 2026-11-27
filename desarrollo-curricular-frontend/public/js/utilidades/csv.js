/*
 * csv.js
 * lectura de archivos CSV: detecta el separador (coma o punto y coma),
 * respeta los campos entre comillas y devuelve una lista de filas
 */
const Csv = {
    async leerArchivo(archivo) {
        const bytes = await archivo.arrayBuffer();
        try {
            return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        } catch (error) {
            return new TextDecoder('windows-1252').decode(bytes);
        }
    },

    // las filas vacias se conservan para que el numero de fila coincida con el del archivo
    analizar(texto) {
        const contenido = texto.replace(/^\uFEFF/, '');
        const separador = Csv.detectarSeparador(contenido);

        const filas = [];
        let fila = [];
        let campo = '';
        let entreComillas = false;

        for (let i = 0; i < contenido.length; i++) {
            const caracter = contenido[i];

            if (entreComillas) {
                if (caracter === '"' && contenido[i + 1] === '"') {
                    campo += '"';
                    i++;
                } else if (caracter === '"') {
                    entreComillas = false;
                } else {
                    campo += caracter;
                }
            } else if (caracter === '"') {
                entreComillas = true;
            } else if (caracter === separador) {
                fila.push(campo);
                campo = '';
            } else if (caracter === '\n' || caracter === '\r') {
                if (caracter === '\r' && contenido[i + 1] === '\n') i++;
                fila.push(campo);
                filas.push(fila);
                fila = [];
                campo = '';
            } else {
                campo += caracter;
            }
        }

        // ultima fila si el archivo no termina con salto de linea
        if (campo !== '' || fila.length > 0) {
            fila.push(campo);
            filas.push(fila);
        }

        return filas;
    },

    detectarSeparador(contenido) {
        const primeraLinea = contenido.split(/\r?\n/)[0] || '';
        const comas = (primeraLinea.match(/,/g) || []).length;
        const puntosYComa = (primeraLinea.match(/;/g) || []).length;
        return puntosYComa > comas ? ';' : ',';
    }
};