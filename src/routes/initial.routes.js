/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerInitial = express.Router();

/* ============ Creacion de objeto ============ */
import { ContenedorSQLite } from '../container/ContenedorSQLite.js';
import { ContenedorFirebase } from "../container/ContenedorFirebase.js";
import { ContenedorMongoDB } from '../container/ContenedorMongoDB.js';
import { UsuariosSchema } from '../../models/users.js';

const cajaMensajes = new ContenedorFirebase('mensajes');
const cajaProducto = new ContenedorSQLite('productos');
const cajaUsuario = new ContenedorMongoDB('usuarios', UsuariosSchema)

/* ================== Mocks ================== */
import { productoMock } from '../mocks/producto.mock.js';

/* =============== Encriptacion =============== */
import bcrypt from 'bcrypt'

async function hashPassGenerator (password) {
    const hashPassword = await bcrypt.hash(password, 10)
    return hashPassword
}

async function verifyPassword(user, pass) {
    const match = await bcrypt.compare(pass, user.password);
    return match
}

/* =============== Passport =============== */
import passport from 'passport';
import { Strategy } from 'passport-local'
const LocalStrategy = Strategy;

passport.use(new LocalStrategy(
async function(username, password, done) {
    let usuario = await cajaUsuario.getAll()
    let existeUsuario = usuario.find(usuario => usuario.username == username)

        if (!existeUsuario) {
            return done(null, false)
        } else {
            const match = await verifyPassword(existeUsuario, password)
            if (!match) {
                return done(null, false)
            }
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

routerInitial.use(passport.initialize());
routerInitial.use(passport.session());

/* ============= Middlewares ============= */

function auth (req, res, next) {
    if (req.isAuthenticated()) {
      next()
    } else {
      res.status(401).redirect('/login')
    }
  };

/* ============= Routing y metodos ============= */
routerInitial.get('/', auth, async (req, res) => {
    const datosUsuario = req.user.username;
    const DB_PRODUCTOS = await cajaProducto.listarAll()
    const DB_MENSAJES = await cajaMensajes.getAll()
    res.render('vista', {DB_PRODUCTOS, DB_MENSAJES, datosUsuario})
})

routerInitial.get('/login', async (req, res) => {
    res.status(200).render('login')
})

routerInitial.get('/login-error', async (req, res) => {
    res.status(200).render('login-error')
})

routerInitial.get('/register', async (req, res) => {
    res.status(200).render('register')
})

routerInitial.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login-error'}));

routerInitial.post('/register', async (req, res) => {
    const { usuario, password } = req.body;
    let infoUser = {
        username: usuario,
        password: await hashPassGenerator(password)
    }
    console.log(infoUser)
    if (usuario || password) {
        let user = await cajaUsuario.getByUser(usuario)
        console.log(user)
        if (user == undefined) {
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
      res.status(402).json(error);
     } else {
      console.log('logout ok');
      res.status(200).redirect('/login');
     }
    });
   });

routerInitial.get('/api/productos-test', auth, async (req, res) => {
    const cajaRandom = new productoMock();
    let productos = cajaRandom.generarDatos()
    res.status(200).render('productos-test', {productos})
})

/* =========== Exportacion de modulo =========== */
export default routerInitial;