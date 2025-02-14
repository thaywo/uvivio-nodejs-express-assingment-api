import { Router } from 'express';
import DB from '../models/db.js';


const router = Router();


 /**
 * Route to check if field value already exist in a Users table
 * @GET /components_data/users_username_exist/{fieldvalue}
 */
router.get('/users_username_exist/:fieldvalue', async (req, res) => {
	try{
		let val = req.params.fieldvalue
		let count = await DB.Users.count({ where:{ 'username': val } });
		if(count > 0){
			return res.ok("true");
		}
		return res.ok("false");
	}
	catch(err){
		return res.serverError(err);
	}
});



 /**
 * Route to check if field value already exist in a Users table
 * @GET /components_data/users_email_exist/{fieldvalue}
 */
router.get('/users_email_exist/:fieldvalue', async (req, res) => {
	try{
		let val = req.params.fieldvalue
		let count = await DB.Users.count({ where:{ 'email': val } });
		if(count > 0){
			return res.ok("true");
		}
		return res.ok("false");
	}
	catch(err){
		return res.serverError(err);
	}
});
export default router;
