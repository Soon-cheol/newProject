declare type MYSVGElement = SVGSVGElement & {
	animationsPaused: () => boolean,
};
declare type MYAniTransEL = SVGElement & {
	beginElement: () => void,
	beginElementAt: (sec: number) => void,
	endElement: () => void,
	endElementAt: (sec: number) => void,
};

declare const cfg_debug: boolean;
declare const cfg_dist: boolean;

/* TEMPLATE */
declare const p_base_template_t: boolean;
declare const p_base_template_s: boolean;

declare const _math_lib_:string;
declare const _project_:string;

declare const ma_prototype_t: boolean;
declare const ma_prototype_s: boolean;
declare const ma_learning_objects_t: boolean;
declare const ma_learning_objects_s: boolean;
declare const ma_warmup_quiz_t: boolean;
declare const ma_warmup_quiz_s: boolean;
declare const ma_summary_t: boolean;
declare const ma_summary_s: boolean;
declare const ma_activity_t: boolean;
declare const ma_activity_s: boolean;

declare const ma_concept_tool_t: boolean;
declare const ma_concept_tool_s: boolean;
declare const ma_check_t: boolean;
declare const ma_check_s: boolean;
declare const ma_independent_practice_t: boolean;
declare const ma_independent_practice_s: boolean;
declare const ma_extended_practice_t: boolean;
declare const ma_extended_practice_s: boolean;
declare const ma_strategy_t: boolean;
declare const ma_strategy_s: boolean;
declare const ma_topic_portfolio_t: boolean;
declare const ma_topic_portfolio_s: boolean;
declare const ma_discussion_t: boolean;
declare const ma_discussion_s: boolean;
declare const ma_reasoning1_t: boolean;
declare const ma_reasoning1_s: boolean;
declare const ma_reasoning2_t: boolean;
declare const ma_reasoning2_s: boolean;
declare const ma_concept_summary_t: boolean;
declare const ma_concept_summary_s: boolean;
declare const ma_concept_learning_t: boolean;
declare const ma_concept_learning_s: boolean;
declare const ma_memory_game_t: boolean;
declare const ma_memory_game_s: boolean;
declare const ma_module_review_t: boolean;
declare const ma_module_review_s: boolean;
declare const ma_mathtalk_t: boolean;
declare const ma_mathtalk_s: boolean;
declare const ma_hidden_picture_t: boolean;
declare const ma_hidden_picture_s: boolean;
declare const ma_hit_mole_t: boolean;
declare const ma_hit_mole_s: boolean;
declare const ma_adaptive_learning_t: boolean;
declare const ma_adaptive_learning_s: boolean;
declare const ma_topic_strategy_t: boolean;
declare const ma_topic_strategy_s: boolean;
declare const ma_assessment_t: boolean;
declare const ma_assessment_s: boolean;
declare const ma_threemin_practice_t: boolean;
declare const ma_threemin_practice_s: boolean;
declare const ma_module_portfolio_t: boolean;
declare const ma_module_portfolio_s: boolean;
declare const ma_independent_practice_r_t: boolean;
declare const ma_independent_practice_r_s: boolean;
declare const ma_extended_practice_r_t: boolean;
declare const ma_extended_practice_r_s: boolean;
declare const ma_strategy_r_t: boolean;
declare const ma_strategy_r_s: boolean;
declare const ma_warmup_quiz_r_t: boolean;
declare const ma_warmup_quiz_r_s: boolean;
declare const ma_assessment_review_t: boolean;
declare const ma_assessment_review_s: boolean;
declare const ma_module_strategy_t: boolean;
declare const ma_module_strategy_s: boolean;
declare const ma_steam_portfolio_t: boolean;
declare const ma_steam_portfolio_s: boolean;
declare const ma_mathtalk2_t: boolean;
declare const ma_mathtalk2_s: boolean;