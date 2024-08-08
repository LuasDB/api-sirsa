const { db,admin,bucket } = require('../db/firebase');

class Reports{
  constructor(){
    this.collection = 'informesPF'
  }
  async getAll(year, id) {
    try {
      const getReports = await db.collection(`${this.collection}${year}`).where('clienteId', '==', id).get();

      const reports = [];

      for (const item of getReports.docs) {
        const filePath = `${year}/${item.data().nombre_pdf}`;
        console.log(filePath);
        const file = bucket.file(filePath);

        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-17-2025' // Puedes cambiar la fecha de expiración si lo necesitas
        });

        reports.push({ id: item.id, ...item.data(), url });
      }

      console.log(reports);
      return { success: true, data: reports, status: 200 };
    } catch (error) {
      return { success: false, message: 'Error en consulta', status: 500, error };
    }
  }
}

module.exports = Reports
