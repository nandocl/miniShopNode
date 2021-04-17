import express from 'express';
let router = express.Router();
import auth from '../middleware/user.perm.midd';

//Controllers
import * as mainCrtl from '../controllers/main.controller';

router.post('/getMainMenu', mainCrtl.getMainMenu);
router.post('/createMenuItem', auth, mainCrtl.createMenuItem);
router.post('/editMenuItem', auth, mainCrtl.editMenuItem);
router.post('/deleteMenuItem', auth, mainCrtl.deleteMenuItem);

router.post('/getStoresMenu', mainCrtl.getStoresMenu);
router.post('/getFullStore', mainCrtl.getFullStore);
router.post('/createStoreItem', auth, mainCrtl.createStoreItem);
router.post('/addStore', auth, mainCrtl.createEditStoreItem);
router.post('/deleteStoreItem', auth, mainCrtl.deleteStoreItem);

export default router;