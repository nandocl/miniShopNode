import { Schema, model } from 'mongoose';

let menuSchema = new Schema({
    name: String,
    state: {type: Boolean, default: true},
    pa: String,
    date: String,
    imp: {type: Number, default: 0}
});

export default model('Menu', menuSchema);