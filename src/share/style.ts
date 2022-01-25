import { transaction } from 'mobx';

const HIDE: React.CSSProperties = {
	opacity: 0,
	pointerEvents: 'none',
};
const HIDE_ANI: React.CSSProperties = {
	opacity: 0,
	pointerEvents: 'none',

	transitionProperty: 'opacity',
	transitionDuration: '0.6s',

};

const NONE: React.CSSProperties = {
	display: 'none',
};

const TRANSI: React.CSSProperties = {
	opacity: 0,
	pointerEvents: 'none',
	transform: 'translateX(65px)',
}
export { HIDE, NONE, HIDE_ANI, TRANSI };