import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server } from 'http';
import { urlencoded, json } from 'body-parser';

//Vars
const port = process.env.PORT || 3000;
const app  = express();
const http = Server(app);

//Config
app.use( urlencoded({ extended: false }) );
app.use( json() );
dotenv.config();

// Iniciar mongoose
mongoose.connect(process.env.mongoUrl, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false 
}).then(() => {
        console.log("Conectado a mongodb");
    }, (err) => { console.log(err); });

//Http routs
import routes from './src/router/routes';

//Http
app.use('/api/', routes);
app.use('/', (req, res) => {res.send({msg: 'Funcionando'})});

//Inicio de servidor
http.listen(port, () => {
    console.log(`Corriendo en el puerto: ${port}`);
})