/**
 * Conta as ATRIBUICOES de estilo (`el.style.width = ...`), mesmo as que nao
 * mudam nada (D-2374).
 *
 * O jsdom nao gera registro de `MutationObserver` quando o estilo recebe o
 * mesmo valor, entao o observador nao serve para provar que uma escrita de
 * estilo foi pulada — a bateria de mutacao mostrou isso (o mutante que
 * devolvia o `el.style.width = ...` cru sobrevivia). Aqui o setter das
 * propriedades pedidas e embrulhado no prototipo do `CSSStyleDeclaration`.
 *
 * @param {string[]} propriedades
 * @returns {{ n: number }} contador que cresce a cada atribuicao
 */
export function contarEscritasDeEstilo(propriedades) {
	const contagem = { n: 0 };
	const amostra = document.createElement('div').style;
	for (const prop of propriedades) {
		let dono = amostra;
		let descritor;
		while (dono && !(descritor = Object.getOwnPropertyDescriptor(dono, prop))) {
			dono = Object.getPrototypeOf(dono);
		}
		if (!descritor || !descritor.set) {
			throw new Error(`o jsdom nao tem setter para style.${prop}`);
		}
		const original = descritor;
		Object.defineProperty(dono, prop, {
			...original,
			set(valor) {
				contagem.n++;
				original.set.call(this, valor);
			}
		});
	}
	return contagem;
}
