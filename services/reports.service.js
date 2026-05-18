const { FieldPath } = require('firebase-admin/firestore');
const { db,admin,bucket } = require('../db/firebase');

const urlServer = process.env.URL_SERVER


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
        const file =`${urlServer}pf/${filePath}`
        console.log(file);

        reports.push({ id: item.id, ...item.data(), url:file });
      }

      console.log(reports);
      return { success: true, data: reports, status: 200 };
    } catch (error) {
      return { success: false, message: 'Error en consulta', status: 500, error };
    }
  }
}

module.exports = Reports
