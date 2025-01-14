function calcularFechaObjetivo(fechaInicial, dias) {
  const diasFestivos = [
    '2025-01-01', // Año Nuevo
    '2025-02-03',// Día de la Constitución
    '2025-03-17', // Natalicio de Benito Juárez
    '2025-05-01', // Día del Trabajo
    '2025-09-16', // Día de la Independencia
    '2025-11-17', // Revolución Mexicana
    '2025-12-25'  // Navidad
];
  let fecha = new Date(fechaInicial);
  let diasContados = 0;

  while (diasContados < dias) {
      fecha.setDate(fecha.getDate() + 1);

      // Comprueba si es fin de semana
      if (fecha.getDay() === 0 || fecha.getDay() === 6) {
          continue; // Salta el día si es sábado o domingo
      }

      // Comprueba si es un día festivo
      if (diasFestivos.some(festivo => {
          return fecha.toISOString().split('T')[0] === festivo;
      })) {
          continue; // Salta el día si es festivo
      }

      diasContados++;
  }

  return fecha;
}

module.exports = calcularFechaObjetivo
