/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
import fs from 'fs'
const routerInitial = express.Router();

/* ============ Creacion de objeto ============ */
import { ContenedorSQLite } from '../container/ContenedorSQLite.js';
import { ContenedorFirebase } from "../container/ContenedorFirebase.js";
import { ContenedorMongoDB } from '../container/ContenedorMongoDB.js';
import { UsuariosSchema } from '../../models/users.js';

import { productoMock } from '../mocks/producto.mock.js';
import { auth } from '../../server.js';

const cajaMensajes = new ContenedorFirebase('mensajes');
const cajaProducto = new ContenedorSQLite('productos');
const cajaUsuario = new ContenedorMongoDB('usuarios', UsuariosSchema)

/* =============== Passport =============== */
import passport from 'passport';
import { Strategy } from 'passport-local'
const LocalStrategy = Strategy;

passport.use(new LocalStrategy(
async function(username, password, done) {
    let usuario = await cajaUsuario.getAll()
    let existeUsuario = usuario.find(usuario => usuario.username == username && usuario.password == password)

        if (!existeUsuario) {
            return done(null, false)
        } else {
            return done(null, existeUsuario)
        }
    }
));

passport.serializeUser((usuario, done)=>{
    done(null, usuario.username)
})

passport.deserializeUser(async (username, done)=> {
    let usuarios = await cajaUsuario.getAll()
    let existeUsuario = usuarios.find(usuario => usuario.username == username)
    done(null, existeUsuario)
})

/* ============= Routing y metodos ============= */
routerInitial.get('/', auth, async (req, res) => {
    const usuario = req.session.usuario;
    const DB_PRODUCTOS = await cajaProducto.listarAll()
    const DB_MENSAJES = await cajaMensajes.getAll()
    res.render('vista', {DB_PRODUCTOS, DB_MENSAJES, usuario})
})

routerInitial.get('/login', async (req, res) => {
    const { usuario, password } = req.query;
    if (!usuario || !password) {
        if (!req.session.contador) {
            req.session.contador = 1
            res.render('login') 
        } else {
            req.session.contador++
            res.render('login')
        }
    } else {
        req.session.usuario = usuario
        res.redirect('/')
    }
})

routerInitial.get('/register', async (req, res) => {
    const { usuario, password } = req.query;
    let infoUser = {
        username: usuario,
        password: password
    }
    if (usuario || password) {
        let user = await cajaUsuario.getByUser(usuario)
        console.log(user)
        if (user == undefined) {
            const registerSuccess = 'Usuario creado exitosamente'
            let guardarDatos = await cajaUsuario.save(infoUser)
            res.redirect('/login')
        } else {
            const errorRegister = 'El usuario que intenta registar ya existe, intente con otro nombre'
            res.render('register', {errorRegister})
        }
    } else {
        res.status(200).render('register')
    }
        
})

routerInitial.get('/logout', async (req, res) => {
    req.session.destroy((error) => {
     if (error) {
      console.log(error);
      res.json({ err });
     } else {
      console.log('logout ok');
      res.redirect('/login');
     }
    });
   });

routerInitial.get('/api/productos-test', auth, async (req, res) => {
    const cajaRandom = new productoMock();
    let productos = cajaRandom.generarDatos()
    res.render('productos-test', {productos})
})

/* =========== Exportacion de modulo =========== */
export default routerInitial;