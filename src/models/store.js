import { Schema, model } from 'mongoose';

let storeSchema = new Schema({
    name: String,
    state: {type: Boolean, default: true},
    pa: String,
    info: String,
    date: String,
    imp: {type: Number, default: 0},
    img: [{type: String}],
    tel: String,
    address: String
});

export default model('Store', storeSchema);