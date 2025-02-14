import { Router } from 'express';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';
import { body } from 'express-validator';
import config from '../config.js';
import utils from '../helpers/utils.js';
import mailer from '../helpers/mailer.js';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';


const router = Router();



/**
 * Route to login user using credential
 * @POST /auth/login
 */
router.post('/login', [
		body('username').trim().not().isEmpty(),
		body('password').not().isEmpty(),
	], validateFormData, async (req, res, next) => {
	try{
		let { username, password } = req.body;
		
		let user = await DB.Users.findOne({where: {[DB.op.or]: {email: username, username: username}}});
		if(!user){
			return res.unauthorized("Username or password not correct");
		}

		if(!utils.passwordVerify(password, user.password)){
			return res.unauthorized("Username or password not correct");
		}
		
		
		
		let loginData = await getUserLoginData(user);
		return res.ok(loginData);

	}
	catch(err){
		return res.serverError(err);
	}
});



/**
 * Route to register new user
 * @POST /auth/register
 */
router.post('/register', 
	[
		body('username').not().isEmpty(),
		body('password').not().isEmpty(),
		body('confirm_password', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)),
		body('email').not().isEmpty().isEmail(),
		body('telephone').not().isEmpty(),
	], validateFormData
, async function (req, res) {
	try{
		let modeldata = req.getValidFormData();
		modeldata.password = utils.passwordHash(modeldata.password);
		
		// check if username already exist.
		let usernameCount = await DB.Users.count({ where:{ 'username': modeldata.username } });
		if(usernameCount > 0){
			return res.badRequest(`${modeldata.username} already exist.`);
		}
		
		// check if email already exist.
		let emailCount = await DB.Users.count({ where:{ 'email': modeldata.email } });
		if(emailCount > 0){
			return res.badRequest(`${modeldata.email} already exist.`);
		}
		
		const record = await DB.Users.create(modeldata);
		const user = record;
		const recid =  record['id'];
		
		let loginData = await getUserLoginData(user);
		return res.ok(loginData);

	}
	catch(err){
		return res.serverError(err);
	}
});








/**
 * Route to send password reset link to user email
 * @POST /auth/forgotpassword
 */
router.post('/forgotpassword', [
		body('email').not().isEmpty().isEmail(),
	], validateFormData, async (req, res) => {
	try{
		const modeldata = req.getValidFormData();
		const email = modeldata.email;
		const user = await DB.Users.findOne({where: { 'email': email} });
		if(!user){
			return res.notFound("Email not registered");
		}
		await sendPasswordResetLink(user);
		
		
		return res.ok("We have emailed your password reset link!");
	}
	catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to reset user password
 * @POST /auth/resetpassword
 */
router.post('/resetpassword', [
		body('password').not().isEmpty().custom((val, { req, loc, path }) => {
			if (val !== req.body.confirm_password) {
				throw new Error("Passwords confirmation does not match");
			} else {
				return val;
			}
        }),
	], validateFormData,  async (req, res) => {
	try{
		const token = req.body.token;
		const userid = getUserIDFromJwt(token);
		const password = req.body.password;
		const where = {id: userid }
		const record = await DB.Users.findOne({where: where});
		if(!record){
			return res.notFound("User not found");
		}
		const newPassword = utils.passwordHash(password);
		const modeldata = { password: newPassword }
		await DB.Users.update(modeldata, {where: where});
		
		
		return res.ok("Password changed");
	}
	catch(err){
		if (err instanceof jwt.TokenExpiredError) {
			return res.badRequest("Token has expired");
		} 
		else if (err instanceof jwt.JsonWebTokenError) {
			return res.badRequest("Invalid token");
		} 
		else {
			return res.serverError(err);
		}
	}
});



/**
 * Send password reset link to user email 
*/
async function sendPasswordResetLink(user){
	let token = generateUserToken(user);
	let resetlink = `${config.app.frontendUrl}/index/resetpassword?token=${token}`;
	let username = user.username;
	let email = user.email;
	let mailtitle = 'Password Reset';
	
	
	let viewData = { username, email, resetlink, config };
	let mailbody = await ejs.renderFile("views/pages/index/password_reset_email_template.ejs", viewData);
	
	let mailResult = await mailer.sendMail(email, mailtitle, mailbody);
	if(!mailResult.messageId){
		throw new Error(mailResult.error);
	}
	return true;
}


/**
 * Return user login data
 * generate a signed jwt for the user
 * @param {object} user - current user
 */
async function getUserLoginData(user){
	const expiresIn = config.auth.jwtDuration + 'm' //in minutes;
	const userid = user.id;
	const token = jwt.sign({ sub: userid }, config.auth.apiTokenSecret, { expiresIn });
	return { token }; //return user object and token
}



/**
 * Generate user auth token
 * @param {object} user - current user
 */
function generateUserToken(user){
	const expiresIn = '10m' //in minutes;
	const userid = user.id;
	const token = jwt.sign({ sub: userid }, config.auth.userTokenSecret, { expiresIn });
	return token;
}



/**
 * Get userid from jwt token
 * @param {string} token
 */
function getUserIDFromJwt(token){
	let decoded = jwt.verify(token, config.auth.userTokenSecret);
	return decoded.sub;
}
export default router;
