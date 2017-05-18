- Transpiler: Add .babelrc file and install presets
- Migrate all JavaScript to React
- Hardcoded URLs in Views should come from server side
- Page titles
- Popup to avoid accidental deletes
- CSS Loaders for AJAX calls
- Add toastr to display errors
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
