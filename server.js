
require('dotenv').config();             
const express = require('express');
const app = express();

// El puerto lo asigna el PaaS (Render); en local usamos 3000
const PUERTO = process.env.PORT || 3000;

// Variables de entorno (en Render se configuran en "Environment")
const ALUMNO = process.env.NOMBRE_ALUMNO || 'Estudiante CECyTEH';
const GRUPO  = process.env.GRUPO || 'Sin grupo';

app.use(express.urlencoded({ extended: true })); // Para leer formularios POST
app.use(express.static('public'));               // Sirve estilos.css

// Escapa texto para mostrarlo de forma segura en HTML
function limpiar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Plantilla de la página
function pagina(contenido) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculadora de Promedio - CECyTEH</title>
  <link rel="stylesheet" href="/estilos.css">
</head>
<body>
  <div class="tarjeta">
    <h1>🎓 Calculadora de Promedio</h1>
    <p class="sub">Desarrollada por <strong>${limpiar(ALUMNO)}</strong> · Grupo ${limpiar(GRUPO)}</p>
    ${contenido}
  </div>
  <footer>☁️ Publicada en Render · M4S1 CECyTEH</footer>
</body>
</html>`;
}

const formulario = `
  <form action="/calcular" method="POST">
    <label>Nombre del alumno:</label>
    <input type="text" name="nombre" required placeholder="Ej. Ana Torres">
    <label>Calificación 1:</label>
    <input type="number" name="cal1" min="0" max="10" step="0.1" required>
    <label>Calificación 2:</label>
    <input type="number" name="cal2" min="0" max="10" step="0.1" required>
    <label>Calificación 3:</label>
    <input type="number" name="cal3" min="0" max="10" step="0.1" required>
    <button type="submit">Calcular promedio</button>
  </form>`;

// Página principal con el formulario
app.get('/', (req, res) => {
  res.send(pagina(formulario));
});

// Procesa el formulario
app.post('/calcular', (req, res) => {
  const nombre = (req.body.nombre || '').trim();
  const cals = [req.body.cal1, req.body.cal2, req.body.cal3].map(Number);

  // Validación en el servidor
  const valido = nombre !== '' && cals.every(c => !isNaN(c) && c >= 0 && c <= 10);
  if (!valido) {
    return res.send(pagina(`<p class="error">❌ Datos inválidos: el nombre es obligatorio y las calificaciones deben estar entre 0 y 10.</p>
      <a href="/">Volver</a>`));
  }

  const promedio = cals.reduce((a, b) => a + b, 0) / cals.length;
  const aprobado = promedio >= 6;

  res.send(pagina(`
    <div class="resultado ${aprobado ? 'ok' : 'mal'}">
      <p>Alumno: <strong>${limpiar(nombre)}</strong></p>
      <p>Calificaciones: ${cals.join(', ')}</p>
      <p class="promedio">Promedio: ${promedio.toFixed(2)}</p>
      <p><strong>${aprobado ? '✅ APROBADO' : '❌ REPROBADO'}</strong></p>
    </div>
    <a href="/">Calcular otro promedio</a>`));
});

// Ruta de salud
app.get('/salud', (req, res) => {
  res.json({ estado: 'ok', alumno: ALUMNO, puerto: PUERTO });
});

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});
