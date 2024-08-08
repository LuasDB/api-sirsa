const { db } = require('./../db/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();



class AuthCustomer {
  constructor() {
    this.collection = 'clientesUsuarios';
  }

  async create(data) {
    console.log('[PASO 1]', data)
    const { nombre, email, password,clienteId } = data;

    // Validación de datos
    if (!nombre || !email || !password ) {
      throw new Error('Todos los campos son requeridos');
    }

    try {
      // Verificar si el usuario ya existe
      const userSnapshot = await db.collection(this.collection).where('email', '==', email).get();
    console.log('[PASO 2]', userSnapshot.empty)


      if (!userSnapshot.empty) {
        return { success: false, status: 409, message: 'El usuario ya existe' };
      }

      const hashedPassword = await bcrypt.hash(password,10)
      // Guardar el nuevo usuario en Firestore
      const newUser = {
        nombre,
        clienteId,
        email,
        password:hashedPassword,
        createdAt: new Date().toISOString(),
        status: 'Activo',
      };

      const userRef = await db.collection(this.collection).add(newUser);

        return { success: true, status: 201, message: 'El usuario se creó correctamente se le envio un correo' };


    } catch (error) {
      console.log(error)
      return { success: false, status: 500, message: 'Error al crear el usuario', error };
    }
  }

  async login(data) {
    const { email, password } = data;
    console.log('[LOGIN 1]', data)


    // Validación de datos
    if (!email || !password) {
      return { success: false, status: 400, message: 'Se requieren todos los datos' };
    }

    try {
      const userSnapshot = await db.collection(this.collection).where('email', '==', email).get();
    console.log('[LOGIN 2]', userSnapshot.empty)



      if (userSnapshot.empty) {
        return { success: false, status: 401, message: 'Credenciales inválidas',data: userSnapshot};
      }

      // Obtener el usuario
      const userDoc = userSnapshot.docs[0];
      const user = userDoc.data();
    console.log('[LOGIN 3]', user)


      // Verificar la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN 4]', isMatch)

      if (!isMatch) {
        return { success: false, status: 401, message: 'Credenciales inválidas' };
      }

      // Generar token JWT
      const token = jwt.sign({ userId: userDoc.id, user}, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
    console.log('[LOGIN 4]', token)



      return { success: true, status: 200, data: { token } };
    } catch (error) {
      return { success: false, status: 500, message: 'Error al iniciar sesión', error };
    }
  }

  async getAll() {
    try {
      const usersQuery = await db.collection(this.collection).where('status', '==', 'Activo').get();
      const users = usersQuery.docs.map((item) => ({ id: item.id, ...item.data() }));

      return { success: true, status: 200, data: users };
    } catch (error) {
      return { success: false, status: 500, message: 'Error al obtener usuarios', error };
    }
  }

  async getOne(id) {
    try {
      const userQuery = await db.collection(this.collection).doc(id).get();
      if (!userQuery.exists) {
        return { success: false, status: 404, message: 'Usuario no encontrado' };
      }

      const { password, ...data } = userQuery.data();
      return { success: true, status: 200, data };
    } catch (error) {
      return { success: false, status: 500, message: 'Error al obtener el usuario', error };
    }
  }

  async updateOne(id, newData) {
    try {
      await db.collection(this.collection).doc(id).update(newData);
      return { success: true, status: 200, message: 'Actualización correcta' };
    } catch (error) {
      return { success: false, status: 500, message: 'Error al actualizar el usuario', error };
    }
  }

  async resetPassword(data){
    const {token, newPassword} = data
    console.log('[PASO 1]',data)

    try {
       // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log('[PASO 2]',decoded)


    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('[PASO 3]',hashedPassword)

    await this.updateOne(userId,{password:hashedPassword})
    return { success:true, status:200, message:'Contraseña actualizada'}
    } catch (error) {
      return { success:false, status:500, message:'Algo salio mal'}

    }
  }
}

module.exports = AuthCustomer;
