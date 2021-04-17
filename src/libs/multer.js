import multer from 'multer';
import moment from 'moment';
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'temp') //Carpeta backend en raiz donde cuardar temporalmente las imagenes
    },
    filename: function (req, file, cb) {
      let r = Math.random().toString(36).substring(7);
      file.date = moment().format('DD-MM-YYYY hh:mm:ss A');
      cb(null, moment().format('YYYYMMDDhhmmss-') + '-' + r)
    }
  })
  
  export const upload = multer({ storage: storage }).array('images', 3);