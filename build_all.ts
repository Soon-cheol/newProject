import * as process from 'process';
import { exec } from 'child_process';


const PROJECTS = [ 
'ox_check_t',
'ox_check_s',
];// end
async function _exec(cmd: string) {
	return new Promise<void>((resolve, reject) => {
		exec(cmd, (error, stdout, stderr) => {
			if(error) {
				console.log('!!!!!!!!!Error' + '\n' + stderr + '\n' + stdout);
				reject(error);
			} else {
				resolve();
				console.log(cmd + '\n' + stdout);
			}
		});
	});
}

async function _run() {
	await _exec('yarn run bundle-prod');

	
	for(let i = 0; i < PROJECTS.length; i++) {
		process.env.kproject = PROJECTS[i];
		console.log('Start ********************', (i + 1) + '/' + PROJECTS.length,  process.env.kproject);
		
		try {
			await _exec('yarn run build-project');
		} catch (e) {
			console.log('Error ********************', (i + 1) + '/' + PROJECTS.length,  process.env.kproject);
			return;
		}
		console.log('Completed ********************', (i + 1) + '/' + PROJECTS.length,  PROJECTS[i], process.env.kproject);
	}
}

_run();

