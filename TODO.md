- Adding PUT methods
- Hide links in view if no permissions
- Auth.js: If user has no permissions -> Show unauthorized message too
- Review security.js and user-template index.js
- Modify security structure to protect only api methods (no need to get accessType)
- Modify users templates to 'clone' youtube
	- Add CREATE (POST), EDIT (PUT), DELETE
	- If Permissions, Add Action buttons
- Transpiler: Extract sass compiler common code to Utils
- Add toastr
- Put tracer everywhere
- Adapt tracer stackLevel for multiple apps
- JSLint + use strict
- Setup SEQUELIZE structure to access multiple dbs from apps
	- Security: Each app can access only a corresponding database
- Generic error handler: If 404 -> Error
- Passport: Securize access through namespace

SQL naming conventions ------------------------------------------------

- Tables and columns names -> Lower snake case (e.g. bank_account for class BankAccount)
- Singular names for tables (e.g. project instead of projects for class Project)
- Suffix many-to-many relations table with _map (e.g. user_permission_map for association between classes User and Permission)

Sequelize stuff ------------------------------------------------

var db1sequelize = new Sequelize('db1', 'db1user','db1pass'...);

db1sequelize.define('User', {...})

db1sequelize.define('Group', {...})

var db2sequelize = new Sequelize('db2', 'db2user','db2pass'...);


$.ajax({
	method: 'PUT',
	url: '/users-template/api/restricted',
	contentType: 'application/json',
	data: JSON.stringify({
		id: 1,
		name: 'Wassaaaaa'
	})
})