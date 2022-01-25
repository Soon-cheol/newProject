import * as process from 'process';
import { exec } from 'child_process';


const PROJECTS = [ 
// 'p_base_template_t',
// 'p_base_template_s',
// 'ma_prototype_t',
// 'ma_prototype_s',
'ma_warmup_quiz_t',
'ma_warmup_quiz_s',
'ma_learning_objects_t',
'ma_learning_objects_s',
// 'ma_summary_t',
// 'ma_summary_s',
'ma_activity_t',
'ma_activity_s',
'ma_concept_tool_t',
'ma_concept_tool_s',
// 'ma_check_t',
// 'ma_check_s',
'ma_independent_practice_t',
'ma_independent_practice_s',
'ma_extended_practice_t',
'ma_extended_practice_s',
'ma_strategy_t',
'ma_strategy_s',
'ma_topic_portfolio_t',
'ma_topic_portfolio_s',
// 'ma_discussion_t',
// 'ma_discussion_s',
// 'ma_reasoning1_t',
// 'ma_reasoning1_s',
// 'ma_reasoning2_t',
// 'ma_reasoning2_s',
'ma_concept_summary_t',
'ma_concept_summary_s',
// 'ma_concept_learning_t',
// 'ma_concept_learning_s',
'ma_memory_game_t',
'ma_memory_game_s',
'ma_module_review_t',
'ma_module_review_s',
'ma_mathtalk_t',
'ma_mathtalk_s',
// 'ma_wrapup_t',
// 'ma_wrapup_s',
'ma_hidden_picture_t',
'ma_hidden_picture_s',
'ma_hit_mole_t',
'ma_hit_mole_s',
'ma_adaptive_learning_t',
'ma_adaptive_learning_s',
'ma_topic_strategy_t',
'ma_topic_strategy_s',
'ma_assessment_t',
'ma_assessment_s',
'ma_threemin_practice_t',
'ma_threemin_practice_s',
'ma_module_portfolio_t',
'ma_module_portfolio_s',
'ma_independent_practice_r_t',
'ma_independent_practice_r_s',
'ma_extended_practice_r_t',
'ma_extended_practice_r_s',
'ma_strategy_r_t',
'ma_strategy_r_s',
'ma_warmup_quiz_r_t',
'ma_warmup_quiz_r_s',
'ma_assessment_review_t',
'ma_assessment_review_s',
'ma_module_strategy_t',
'ma_module_strategy_s',
'ma_steam_portfolio_t',
'ma_steam_portfolio_s',
'ma_mathtalk2_t',
'ma_mathtalk2_s',
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

