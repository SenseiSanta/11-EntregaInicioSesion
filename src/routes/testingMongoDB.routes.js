/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
import { UsuariosSchema } from '../../models/users.js';
import { ContenedorMongoDB } from '../container/ContenedorMongoDB.js';
const routerTesting = express.Router();

/* ============ Creacion de objeto ============ */
const cajaUsuario = new ContenedorMongoDB('usuarios', UsuariosSchema)

/* ============= Routing y metodos ============= */
routerTesting.get('/obtenertodo', async (req, res) =>{
    let datos = await cajaUsuario.getAll()
    res.json(datos)
})

routerTesting.get('/login', async (req, res) =>{
    const { username } = req.body
    let datos = await cajaUsuario.getByUser(username)
    res.json(datos)
})

routerTesting.post('/registro', async (req, res) =>{
    let datos = await cajaUsuario.save(req.body)
    res.json(datos)
})

routerTesting.put('/actualizar', async (req, res) =>{
    let { username, password } = req.body;
    let datos = await cajaUsuario.update(username, password)
    res.json(datos)
})

routerTesting.delete('/borraruser', async (req, res) => {
    let { username } = req.body;
    console.log(username)
    let datos = await cajaUsuario.deleteByUsername(username)
    res.json(datos)
})

routerTesting.delete('/borrartodo', async (req, res) => {
    let datos = await cajaUsuario.deleteAll()
    res.json(datos)
})
/* =========== Exportacion de modulo =========== */
export default routerTesting;