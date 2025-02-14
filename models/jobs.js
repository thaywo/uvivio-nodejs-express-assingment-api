
import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Jobs extends BaseModel {
	static init() {
		return super.init(
			{
				
				id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
				title: { type:Sequelize.STRING , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') },
				description: { type:Sequelize.STRING , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') },
				skills: { type:Sequelize.ARRAY(Sequelize.TEXT) , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') },
				created_at: { type:Sequelize.DATE  ,defaultValue: Sequelize.literal('DEFAULT') }
			}, 
			{ 
				sequelize,
				schema: "public", 
				tableName: "jobs",
				modelName: "jobs",
			}
		);
	}
	
	static listFields() {
		return [
			'id', 
			'title', 
			'description', 
			'skills', 
			'created_at'
		];
	}

	static viewFields() {
		return [
			'id', 
			'title', 
			'description', 
			'skills', 
			'created_at'
		];
	}

	static editFields() {
		return [
			'id', 
			'title', 
			'description', 
			'skills'
		];
	}

	
	static searchFields(){
		return [
			Sequelize.literal("CAST(id AS TEXT) iLIKE :search"), 
			Sequelize.literal("title iLIKE :search"), 
			Sequelize.literal("description iLIKE :search"),
		];
	}

	
	
}
Jobs.init();
export default Jobs;
