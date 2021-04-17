import mongoose from 'mongoose';
import moment from 'moment';
import {upload} from '../libs/multer';
import {v2} from 'cloudinary';
import fs from 'fs';

//Models
import Menu from '../models/menu';
import Store from '../models/store';

//Vars


/////////////////Menues
//Obtiene lista de elementos a partir de pa - body = {pa: 'main'/'id'}
export async function getMainMenu(req, res){
    Menu.find({pa: req.body.pa}, function (err, menu) {
        if(err) return res.status(500).send();
        res.status(200).send(menu);
    });
}

//Crea un item de menu - body = {name: '', pa: 'main'/'id'}
export async function createMenuItem(req, res){
    let body = req.body;
    Menu.findOne({name: body.name}, function (err, menuItem) {
        if(err) return res.send(500).send();
        if(menuItem != null) return res.send(407).send();
        let newItemData = {
            name: body.name,
            pa: body.pa,
            date: moment().format('DD-MM-YYYY hh:mm A')
        };
        let newItem = new Menu(newItemData);
        newItem.save().then(() => {
            res.status(200).send({msg: 'Created'});
        });
    });
}

//Editar item de menu - body = {id: '', newName: ''}
export async function editMenuItem(req, res){
    Menu.findByIdAndUpdate(req.body.id, {name: req.body.newName}, {new: true}, function (err, menuItem) {
        if(err) return res.send(500).send();
        res.status(200).send();
    });
}

//Borrar item de menu - body = {id: ''}
export async function deleteMenuItem(req, res){
    Menu.find({pa: req.body.id}, function(err, menuItem){
        if(err) return res.status(500).send();
        if(menuItem.length == 0){
            Store.find({pa: req.body.id}, function(err, storeItem) {
                if(err) return res.status(500).send();
                if(storeItem.length == 0){
                    Menu.findByIdAndDelete(req.body.id, function (err, menuItem) {
                        if(err) return res.status(500).send();
                        res.status(200).send();
                    });
                }else
                return res.status(406).send();
            });     
        }else
            return res.status(406).send();
    });
}

/////////////////////Stores
//Obtiene lista de elementos store a partir de pa - body = {pa: 'id'}
export async function getStoresMenu(req, res){
    Store.find({pa: req.body.pa}, function (err, menu) {
        if(err) return res.status(500).send();
        res.status(200).send(menu);
    });
}

export async function getFullStore(req, res){
    Store.findById(req.body.id, function (err, storeItem) {
        if(err) return res.status(500).send();
        res.status(200).send(storeItem);
    });
}

//Crea un item de store - body = {name: '', pa: 'id', info: '', img: '', tel: ''}
export async function createStoreItem(req, res){
    let body = req.body;
    Store.findOne({name: body.name}, function (err, storeItem) {
        if(err) return res.send(500).send();
        if(storeItem != null) return res.send(407).send();
        let newItemData = {
            name: body.name,
            pa: body.pa,
            info: body.info,
            date: moment().format('DD-MM-YYYY hh:mm A'),
            img: body.img,
            tel: body.tel
        };
        let newItem = new Store(newItemData);
        newItem.save().then(() => {
            res.status(200).send({msg: 'Created'});
        });
    });
}

//Borrar store item - body = {id: ''}
export async function deleteStoreItem(req, res){
    Store.findByIdAndDelete(req.body.id, async function (err, storeItem) {
        if(err) return res.status(406).send();
        for(const img of storeItem.img) {
            // let publicId = img.split('upload/')[1].split('/')[1].split('.')[0];
            let publicId = img.split('diroca/')[1].split('.')[0];
            await removeImagesInCloud(publicId);
        };
        res.status(200).send({msg: 'Deleted'});
    });
}

export const createEditStoreItem2 = async (req, res) => {
    upload(req,res, async function(err) {        
        let prod = req.body;
        let imgList = [];
        if(prod.img != '[]') {
            imgList = prod.img.replace('[', '').replace(']', '').split('"').join('').split(',');
        }
        if(prod.delImg != '[]') {
            prod.delImg = prod.delImg.replace('[', '').replace(']', '').split('"').join('').split(',');            
        }else prod.delImg = [];
        if(req.files.length != 0){
            for(const img of req.files) {
                let imgPath = await saveImagesInCloud(img);
                imgList.push(imgPath)
            };
        }
        prod.img = imgList;
        if(prod.id != ''){
            //Actualizar item
            let prodId = prod['id'];
            let toDelete = prod.delImg;
            delete prod['id'];
            delete prod['pa'];
            delete prod['delImg'];
            if(toDelete.length != 0) {
                for(const img of toDelete) {
                    let publicId = img.split('upload/')[1].split('/')[1].split('.')[0];
                    await removeImagesInCloud(publicId);
                };
            };
            Store.findByIdAndUpdate(prodId, prod, function(err, toUpdateItem) {
                if(err) return res.status(406).send();
                return res.status(200).send();
            });
        }else{
            //Guardar item
            delete prod['id'];
            prod.date = moment().format('DD-MM-YYYY hh:mm A');
            let newStore = new Store(prod);
            newStore.save().then(() => {
                return res.status(200).send({msg: 'Saved'});
            }).catch((err) => {
                console.log(err)
                res.status(500).send()
            });
        }
    });
}

export const createEditStoreItem = async (req, res) => {
    upload(req,res, async function(err) {        
        let prod = req.body;
        let imgList = [];
        let imgPrevList = [];
        if(prod.img != '[]') {
            imgList = prod.img.replace('[', '').replace(']', '').split('"').join('').split(',');
            imgPrevList = imgList;
        }
        if(req.files.length != 0){
            for(const img of req.files) {
                let imgPath = await saveImagesInCloud(img);
                imgList.push(imgPath)
            };
        }
        prod.img = imgList;
        if(prod.id != ''){
            //Actualizar item
            let prodId = prod['id'];
            delete prod['id'];
            delete prod['pa'];
            delete prod['delImg'];
            Store.findByIdAndUpdate(prodId, prod, async function(err, toUpdateItem) {
                if(err) return res.status(406).send();
                for(let i = 0; i < toUpdateItem.img.length; i++){
                    let isInclude = imgPrevList.includes(toUpdateItem.img[i]);
                    if(!isInclude) {
                        // let publicId = toUpdateItem.img[i].split('upload/')[1].split('/')[1].split('.')[0];
                        let publicId = toUpdateItem.img[i].split('diroca/')[1].split('.')[0];
                        await removeImagesInCloud(publicId);
                    }
                }
                return res.status(200).send();
            });
        }else{
            //Guardar item
            delete prod['id'];
            prod.date = moment().format('DD-MM-YYYY hh:mm A');
            let newStore = new Store(prod);
            newStore.save().then(() => {
                return res.status(200).send({msg: 'Saved'});
            }).catch((err) => {
                console.log(err)
                res.status(500).send()
            });
        }
    });
}

const saveImagesInCloud = async (image) => {
    v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
    // return new Promise((resolve, rejects) => {
    //     v2.uploader.upload(image.path, (err, img) => {
    //         fs.unlinkSync(image.path);
    //         resolve(img.url);
    //     });
    // });
    return new Promise((resolve, rejects) => {
        v2.uploader.upload(image.path, {folder: 'diroca'}, (err, img) => {
            fs.unlinkSync(image.path);
            resolve(img.url);
        });
    });
};

const removeImagesInCloud = async (image) => {
    v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
    return new Promise((resolve, rejects) => {
        v2.uploader.destroy('diroca/' + image, (err, result) => {
            resolve();
        });
    });
};