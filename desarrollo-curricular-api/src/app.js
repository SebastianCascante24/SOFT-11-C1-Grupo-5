// configuracion y arranque del API

require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const rutasRecursos = require('./routes/recursos.routes');

const app = express();

app.use(cors({
    origin: process.env.ORIGEN_FRONTEND,
    credentials: true
}));

app.use(express.json());

app.get('/api', (req, res) => {
    res.json({ mensaje: 'API funcionando' });
});

// agregar rutas aca (dejando esta generica de ultima)
app.use('/api', rutasRecursos);

// Si la ruta no existe
app.use('/api', (req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

const puerto = process.env.PORT || 4000;
app.listen(puerto, () => {
    console.log(`API en http://localhost:${puerto}`);
});