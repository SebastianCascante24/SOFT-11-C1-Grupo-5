// configuracion y arranque del API

require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: process.env.ORIGEN_FRONTEND,
    credentials: true
}));

app.use(express.json());

app.get('/api', (req, res) => {
    res.json({ mensaje: 'API funcionando' });
});

const puerto = process.env.PORT || 4000;
app.listen(puerto, () => {
    console.log(`API en http://localhost:${puerto}`);
});