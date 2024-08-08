const xlsx = require('xlsx');
const {db} = require('./db/firebase')

// Lee el archivo de Excel
const workbook = xlsx.readFile('uploads/dbExport/pruebaFirestore.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convierte los datos del archivo de Excel a JSON
const jsonData = xlsx.utils.sheet_to_json(worksheet);

async function uploadData() {
  const collectionRef = db.collection('yourFirestoreCollection');

  for (const row of jsonData) {
    const newDocRef = collectionRef.doc(); // Crea un nuevo documento con un ID generado automáticamente
    await newDocRef.set(row);
    console.log(`Documento agregado con ID: ${newDocRef.id}`);
  }

  console.log('Todos los datos han sido subidos a Firestore.');
}

uploadData().catch(console.error);


