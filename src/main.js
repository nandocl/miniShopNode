import express from 'express';
import mongoose from 'mongoose';
if(process.env.NODE_ENV !== 'production') {
    console.log('dev')
    require('dotenv').config();
}else{
    console.log('prod')
}
import { Server } from 'http';
import { urlencoded, json } from 'body-parser';

//Vars
const port = process.env.PORT || 3000;
const app  = express();
const http = Server(app);

//Config
app.use( urlencoded({ extended: false }) );
app.use( json() );

// Iniciar mongoose
mongoose.connect(process.env.mongoUrl, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false 
}).then(() => {
        console.log("Conectado a mongodb");
    }, (err) => { console.log(err); });

//Http routs
import routes from './router/routes';

//Http
app.use('/api/', routes);
app.use('/', (req, res) => {res.send({msg: 'Funcionando'})});

//Inicio de servidor
http.listen(port, () => {
    console.log(`Corriendo en el puerto: ${port}`);
})