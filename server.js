// servidor web del frontend que sirve la carpeta public/

const path = require('path');
const express = require('express');
const app = express();

// entregar los archivos del frontend
app.use(express.static(path.join(__dirname)));

// puerto donde se va a hostear, definido en .env como PORT o 3000 por defecto
const puerto = process.env.PORT || 3000;

app.listen(puerto, () => {
    console.log(`Frontend en http://localhost:${puerto}`);
});