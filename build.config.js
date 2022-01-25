const PROJECT = process.env.kproject;
const WWWROOT = 'output/resources/app/public';

const PROJECTS = [
	{value: "p_base_template", isNew: true},	// template
	{value: "ox_check", isNew: true},
];
console.log(PROJECT, process.argv, process.argv0);

const _config = {
	cfg_debug: process.env.NODE_ENV !== "production",
	cfg_dist: process.env.NODE_ENV === "production",
	mathalive_lib: 'content/mathalive_lib',
};
PROJECTS.forEach((prj) => {
	let t = prj.value + "_t";
	let s = prj.value + "_s";

	_config[t] = t === PROJECT;
	_config[s] = s === PROJECT;

	if(_config[t] || _config[s]) _config['ISNEW'] = prj.isNew;
});

console.log(_config);

if(PROJECT) {
	const _path = (() => {
		let s = PROJECT.indexOf('_');
		let e = PROJECT.lastIndexOf('_');

		let mid = PROJECT.substring(s+1, e);

		let fst = PROJECT.substring(0, s).toUpperCase();

		let last = PROJECT.endsWith("_t") ? 'teacher' : 'student';

		return {
			projectDir: `content/mathalive_lib/${fst}/${mid}`,
			outDir: `content/mathalive_lib/${fst}/${mid}/${last}`,
			jsPath: `js/${last}.js`,
		};
	})();

	console.log(_path);


	const ASSETS = [
		'content',
		_path.projectDir,
	];
	_path.wwwroot = WWWROOT;
	_path.assets = ASSETS;

	_config._math_lib_ = JSON.stringify('/content/mathalive_lib/');
	_config._project_ = JSON.stringify('/' + _path.projectDir + '/');
  _config.paths = _path;
  _config._build_timestamp_ = JSON.stringify('===build-timestamp: ' + new Date().toString());
}else{
	_config.paths = {
		wwwroot: WWWROOT,
	};
}

module.exports = _config;
