
import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Users extends BaseModel {
	static init() {
		return super.init(
			{
				
				id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
				username: { type:Sequelize.STRING , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') },
				password: { type:Sequelize.STRING , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') },
				email: { type:Sequelize.STRING , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') },
				telephone: { type:Sequelize.STRING , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') },
				created_at: { type:Sequelize.DATE  ,defaultValue: Sequelize.literal('DEFAULT') }
			}, 
			{ 
				sequelize,
				schema: "public", 
				tableName: "users",
				modelName: "users",
			}
		);
	}
	
	static listFields() {
		return [
			'id', 
			'username', 
			'email', 
			'telephone', 
			'created_at'
		];
	}

	static viewFields() {
		return [
			'id', 
			'username', 
			'email', 
			'telephone', 
			'created_at'
		];
	}

	static accounteditFields() {
		return [
			'id', 
			'username', 
			'telephone'
		];
	}

	static accountviewFields() {
		return [
			'id', 
			'username', 
			'email', 
			'telephone', 
			'created_at'
		];
	}

	static editFields() {
		return [
			'id', 
			'username', 
			'telephone'
		];
	}

	
	static searchFields(){
		return [
			Sequelize.literal("CAST(id AS TEXT) iLIKE :search"), 
			Sequelize.literal("username iLIKE :search"), 
			Sequelize.literal("email iLIKE :search"), 
			Sequelize.literal("telephone iLIKE :search"),
		];
	}

	
	
}
Users.init();
export default Users;
