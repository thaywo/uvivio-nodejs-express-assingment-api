
/**
* Role Based Access Control
* @category  RBAC Helper
*/


// not implemented
class Rbac{

	static AUTHORIZED = "authorized";
	static FORBIDDEN = "forbidden";
	static UNKNOWN_ROLE = "unknown_role";

	userPages = [];

	constructor(role){
		this.userRole = role;
	}

	async getUserPages(){
		return this.userPages;
	}

	async getRoleName(){
		return '';
	}

	getPageAccess (path){
		return Rbac.AUTHORIZED;
	}
}

export default Rbac;
