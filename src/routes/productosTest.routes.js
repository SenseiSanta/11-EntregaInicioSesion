/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerProductosTest = express.Router();
import { productoMock } from '../mocks/producto.mock.js'

/* ============ Creacion de objeto ============ */
const caja = new productoMock();

/* ============= Routing y metodos ============= */
routerProductosTest.get('/', (req, res) => {
    let PRODUCTOS = caja.generarDatos()
    console.log(PRODUCTOS)
    res.render('productos-test')
})

/* =========== Exportacion de modulo =========== */
export default routerProductosTest;