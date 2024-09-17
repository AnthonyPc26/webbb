// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

// Configuración de la base de datos
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`CREATE TABLE people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zona TEXT,
        nombre TEXT,
        direccion TEXT,
        dni TEXT,
        telefono TEXT,
        edad INTEGER
    )`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas de la API

// Obtener todas las personas
app.get('/api/people', (req, res) => {
    db.all('SELECT * FROM people', (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(rows);
    });
});

// Agregar una persona
app.post('/api/people', (req, res) => {
    const { zona, nombre, direccion, dni, telefono, edad } = req.body;
    db.run(
        `INSERT INTO people (zona, nombre, direccion, dni, telefono, edad) VALUES (?, ?, ?, ?, ?, ?)`,
        [zona, nombre, direccion, dni, telefono, edad],
        function (err) {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Actualizar persona
app.put('/api/people/:id', (req, res) => {
    const { zona, nombre, direccion, dni, telefono, edad } = req.body;
    const { id } = req.params;
    db.run(
        `UPDATE people SET zona = ?, nombre = ?, direccion = ?, dni = ?, telefono = ?, edad = ? WHERE id = ?`,
        [zona, nombre, direccion, dni, telefono, edad, id],
        function (err) {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.json({ changes: this.changes });
        }
    );
});

// Eliminar persona
app.delete('/api/people/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM people WHERE id = ?`, [id], function (err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Exportar a Excel
app.get('/api/export', (req, res) => {
    db.all('SELECT * FROM people', (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }

        let csvContent = 'ITEM,ZONA,NOMBRE,DIRECCION,DNI,TELEFONO,EDAD\n';
        rows.forEach((row, index) => {
            csvContent += `${index + 1},${row.zona},${row.nombre},${row.direccion},${row.dni},${row.telefono},${row.edad}\n`;
        });

        res.setHeader('Content-Disposition', 'attachment; filename="people.csv"');
        res.setHeader('Content-Type', 'text/csv');
        res.send(csvContent);
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
