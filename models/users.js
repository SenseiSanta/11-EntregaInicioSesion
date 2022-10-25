import mongoose from 'mongoose';

export const UsuariosSchema = new mongoose.Schema({
    username: {type: String, require:true, max:20},
    password: {type: String, require:true, max:30}
});