
import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Candidates extends BaseModel {
	static init() {
		return super.init(
			{
				
				id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
				name: { type:Sequelize.STRING , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') },
				skills: { type:Sequelize.ARRAY(Sequelize.TEXT) , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') },
				created_at: { type:Sequelize.DATE  ,defaultValue: Sequelize.literal('DEFAULT') }
			}, 
			{ 
				sequelize,
				schema: "public", 
				tableName: "candidates",
				modelName: "candidates",
			}
		);
	}
	
	static listFields() {
		return [
			'id', 
			'name', 
			'skills', 
			'created_at'
		];
	}

	static viewFields() {
		return [
			'id', 
			'name', 
			'skills', 
			'created_at'
		];
	}

	static editFields() {
		return [
			'id', 
			'name', 
			'skills'
		];
	}

	
	static searchFields(){
		return [
			Sequelize.literal("CAST(id AS TEXT) iLIKE :search"), 
			Sequelize.literal("name iLIKE :search"),
		];
	}

	
	
}
Candidates.init();
export default Candidates;
