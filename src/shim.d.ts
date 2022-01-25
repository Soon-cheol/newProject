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

declare const ox_check_t: boolean;
declare const ox_check_s: boolean;