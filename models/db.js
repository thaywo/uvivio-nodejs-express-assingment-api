
import { Sequelize, sequelize } from './basemodel.js';

// Override timezone formatting
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
	return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss');
};

import Candidates from './candidates.js';
import Jobs from './jobs.js';
import Users from './users.js';



const op = Sequelize.Op;
const raw = Sequelize.literal; // use to include raw expression

const filterBy = function(expression, value){
	return sequelize.where(raw(expression), value);
}

// convinient functions for performing raw queries 
// return different value types

function rawQuery(queryText, options){
	return sequelize.query(queryText, options);
}

async function rawQueryList(queryText, queryParams){
	const records = await rawQuery(queryText, { replacements: queryParams, type: Sequelize.QueryTypes.SELECT });
	return records;
}

async function rawQueryOne(queryText, queryParams){
	const records = await rawQueryList(queryText, queryParams);
	return records[0] || null;
}

async function rawQueryValue(queryText, queryParams){
	const record = await rawQueryOne(queryText, queryParams);
	if(record){
		return Object.values(record)[0];
	}
	return null;
}

function getOrderBy(req, sortField = null, sortType = 'desc'){
	const orderBy = req.query.orderby || sortField;
	const orderType = req.query.ordertype || sortType;
	if (orderBy) {
		let order = raw(`${orderBy} ${orderType}`);
		return [[order]];
	}
	return null;
}

export default {
	sequelize,
	op,
	filterBy,
	raw,
	rawQuery,
	rawQueryList,
	rawQueryOne,
	rawQueryValue,
	getOrderBy,
	Candidates,
	Jobs,
	Users
}
