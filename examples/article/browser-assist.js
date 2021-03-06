import { formatter, linebreak, INFINITY } from 'typeset';

const spaceShrink = 1 / 9 * 12;
const spaceStretch = 1 / 6 * 12;

function wordSpacing(ratio) {
	return ratio * (ratio < 0 ? spaceShrink : spaceStretch);
}

export default function browserAssistTypeset(
	{ id, text, measureText, textAlign, lineLengths, tolerance }
) {
	const browserAssistElement = document.getElementById(id);

	const nodes =
		formatter({ text, measureText, textAlign, hyphenateLimitChars: 4 });
	const { positions, ratios } = linebreak(nodes, lineLengths, {tolerance: tolerance});

	const lines = positions.map((position, i, positions) => {
		let lastBreak = positions[i - 1] || 0;
		// After a line break, we skip any nodes unless they are boxes or forced breaks.
		// while (lastBreak < nodes.length) {
		// 	if (nodes[lastBreak].Box) break;
		// 	if (nodes[lastBreak].Penalty && nodes[lastBreak] === -INFINITY) break;
		// 	lastBreak++;
		// }
		return nodes.slice(lastBreak, position);
	});

	// set the lines
	const linesFragment = document.createDocumentFragment();

	lines.forEach((nodes, i) => {
		const span = document.createElement('span');
		span.style.wordSpacing = `${wordSpacing(ratios[i])}px`;
		span.style.display = 'inline-block';
		span.style.whiteSpace = 'nowrap';
		span.appendChild(document.createTextNode(nodes.reduce((memo, node) => {
			if (node.Box) return memo + node.value;
			if (node.Glue) return memo + ' ';
			return memo
		}, '')));
		linesFragment.appendChild(span);
	});

	browserAssistElement.appendChild(linesFragment);

	// set the ratios
	const ratiosList = document.createElement('ul');

	ratios.forEach(ratio => {
		const li = document.createElement('li');
		li.appendChild(document.createTextNode(ratio.toFixed(3)));
		ratiosList.appendChild(li);
	});

	browserAssistElement.parentNode.appendChild(ratiosList);
}
