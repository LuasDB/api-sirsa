function ordenarPor(array,element){
  return array.slice().sort((a,b)=>{
    if(a[element] < b[element]){
      return -1
    }
    if(a[element] > b[element]){
      return 1
    }
    return 0
  });
}

// Ejemplo de uso:
const arrayDeObjetos = [
  { razon_social: 'Carlos', edad: 30 },
  { razon_social: 'Ana', edad: 25 },
  { razon_social: 'Beatriz', edad: 28 }
];

const arrayOrdenado = ordenarPor(arrayDeObjetos);
console.log(arrayOrdenado);

module.exports = ordenarPor
