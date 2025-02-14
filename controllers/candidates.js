import { Router } from 'express';
import { body } from 'express-validator';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';


const router = Router();





/**
 * Route to list candidates records
 * @GET /candidates/index/{fieldname}/{fieldvalue}
 */
router.get(['/', '/index/:fieldname?/:fieldvalue?'], async (req, res) => {  
	try{
		const query = {};
		let queryFilters = [];
		let where = {};
		let replacements = {};
		let fieldName = req.params.fieldname;
		let fieldValue = req.params.fieldvalue;
		
		if (fieldName){
			queryFilters.push(DB.filterBy(fieldName, fieldValue));
		}
		let search = req.query.search;
		if(search){
			let searchFields = DB.Candidates.searchFields();
			where[DB.op.or] = searchFields;
			replacements.search = `%${search}%`;
		}
		
		if(queryFilters.length){
			where[DB.op.and] = queryFilters;
		}
		query.raw = true;
		query.where = where;
		query.replacements = replacements;
		query.order = DB.getOrderBy(req, 'id', 'desc');
		query.attributes = DB.Candidates.listFields();
		let page = parseInt(req.query.page) || 1;
		let limit = parseInt(req.query.limit) || 10;
		let result = await DB.Candidates.paginate(query, page, limit);
		return res.ok(result);
	}
	catch(err) {
		return res.serverError(err);
	}
});


/**
 * Route to view Candidates record
 * @GET /candidates/view/{recid}
 */
router.get('/view/:recid', async (req, res) => {
	try{
		const recid = req.params.recid || null;
		const query = {}
		const where = {}
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Candidates.viewFields();
		let record = await DB.Candidates.findOne(query);
		if(!record){
			return res.notFound();
		}
		return res.ok(record);
	}
	catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to insert Candidates record
 * @POST /candidates/add
 */
router.post('/add/', 
	[
		body('name').not().isEmpty(),
		body('skills').not().isEmpty(),
	], validateFormData
, async function (req, res) {
	try{
		let modeldata = req.getValidFormData();
		
    if (typeof modeldata.skills === "string") {
      modeldata.skills = modeldata.skills.split(",").map((skill) => skill.trim());
    }
    
		//save Candidates record
		let record = await DB.Candidates.create(modeldata);
		//await record.reload(); //reload the record from database
		const recid =  record['id'];
		
		return res.ok(record);
	} catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to get  Candidates record for edit
 * @GET /candidates/edit/{recid}
 */
router.get('/edit/:recid', async (req, res) => {
	try{
		const recid = req.params.recid;
		const query = {};
		const where = {};
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Candidates.editFields();
		let record = await DB.Candidates.findOne(query);
		if(!record){
			return res.notFound();
		}
		return res.ok(record);
	}
	catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to update  Candidates record
 * @POST /candidates/edit/{recid}
 */
router.post('/edit/:recid', 
	[
		body('name').optional({nullable: true}).not().isEmpty(),
		body('skills').optional({nullable: true}).not().isEmpty(),
	], validateFormData
, async (req, res) => {
	try{
		const recid = req.params.recid;
		let modeldata = req.getValidFormData({ includeOptionals: true });
		const query = {};
		const where = {};
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Candidates.editFields();
		let record = await DB.Candidates.findOne(query);
		if(!record){
			return res.notFound();
		}
		await DB.Candidates.update(modeldata, {where: where});
		return res.ok(modeldata);
	}
	catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to delete Candidates record by table primary key
 * Multi delete supported by recid separated by comma(,)
 * @GET /candidates/delete/{recid}
 */
router.get('/delete/:recid', async (req, res) => {
	try{
		const recid = (req.params.recid || '').split(',');
		const query = {};
		const where = {};
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		let records = await DB.Candidates.findAll(query);
		records.forEach(async (record) => { 
			//perform action on each record before delete
		});
		await DB.Candidates.destroy(query);
		return res.ok(recid);
	}
	catch(err){
		return res.serverError(err);
	}
});
export default router;
