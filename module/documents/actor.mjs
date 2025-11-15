/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class ShinobiActor extends Actor {
    /** @override */
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: ...
        super.prepareData();
        
        // --- CHAME A FUNÇÃO DE LÓGICA DE CÁLCULO AQUI ---
        if (this.type === 'ninja') {
            applyConfigLogic(this.system); // ESTA É A LINHA ADICIONADA
			function applyConfigLogic(actorData) {
    const data = actorData;
    const configs = data.configuracoes; 
    const attrs = data.attributes;
    const defs = data.defesas;
    const resources = data.resources;
    const pericias = data.pericias;
    
    // --- 1. RECURSOS ---
    const nivelCampanha = data.details.nc.value || 0; 
    
    // Regra: 3 Pts de Poder por Nível (NC)
    if (configs.regra3PtsPoderPorNivel.value === true) {
        data.pontosDePoder.max = nivelCampanha * 3;
    }

    // Variável: Corações do Jiongu (Afeta Vitalidade Máxima)
    const coracoes = configs.coracoesDoJiongu.value || 0;
    if (coracoes > 0) {
        resources.vitalidade.max += (coracoes * 10);
    }
    
    // Configura o Recurso Extra
    if (configs.pontosKamiArte.value === true) {
        resources.recursoExtra.max += 10;
        resources.recursoExtra.label = "Pts Kami Arte";
    } else if (configs.pontosKamiEspirito.value === true) {
        resources.recursoExtra.max += 5; 
        resources.recursoExtra.label = "Pts Kami Espírito";
    } else if (configs.pontosDeVisaoMangekyo.value === true) {
        resources.recursoExtra.max += 3; 
        resources.recursoExtra.label = "Pts Visão Mangekyo";
    } else if (configs.pontosDeSaudeKujaku.value === true) {
        resources.recursoExtra.max += 8;
        resources.recursoExtra.label = "Pts Saúde Kujaku";
    } else if (configs.pontosSuikaHozuki.value === true) {
        resources.recursoExtra.max += 7;
        resources.recursoExtra.label = "Pts Suika";
    } else {
        // Se nenhum recurso extra estiver ativo, garante que o label volte ao padrão
        resources.recursoExtra.label = "Recurso Extra"; 
    }

    // --- 2. DEFESAS E COMBATE ---
    
    // Variável: Dureza Manual
    const durezaManual = configs.durezaManual.value || 0;
    defs.dureza.base += parseInt(durezaManual); 

    // Aptidão Restrita: Armadura Óssea (Kaguya)
    if (configs.armaduraOsseaKaguya.value === true) {
        defs.dureza.base += 5;
    }

    // Condição Simples: Acelerado (Afeta Agilidade/Iniciativa)
    if (configs.acelerado.value === true) {
        attrs.agilidade.mod += 2; 
    }

    // --- 3. MOVIMENTAÇÃO E PERÍCIAS ---
    
    // Condições: Shunjutsu Nível 1 e 3 (Afetam o Deslocamento)
    const deslocBase = data.deslocamento.base; 
    let multiplicadorDesloc = 1;

    if (configs.shunjutsuNivel3.value === true) {
        multiplicadorDesloc = 3;
    } else if (configs.shunjutsuNivel1.value === true) {
        multiplicadorDesloc = 2;
    }
    data.deslocamento.total = deslocBase * multiplicadorDesloc;
    
    // Regras de Bônus em Perícia
    if (configs.diligente.value === true) {
        pericias.concentracao.total += 2;
    }
    if (configs.quimico.value === true) {
        pericias.veneficio.total += 2;
    }
    if (configs.regraKikaichuu.value === true) {
        defs.dureza.base += 1;
    }

    return data;
}
        }
        
        // O restante da sua lógica original de prepareData() segue aqui.
    }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
		const actorData = this;
  }

	prepareEmbbededData() {
		// TODOS OS ITENS
		// TODOS OS EFEITOS
		// applyActiveEffects();
	}

	prepareDerivedData() {
		if (this.type == "Ninja") this._prepareNinjaDerived(this);
		if (this.type == "NPC") this._prepareNPCDerived(this);
		this.items.forEach(i => i._prepareTemplate(i));
	}

	_prepareNinjaDerived(actorData) {
		const system = actorData.system;
		const details = system.details;
		const attributes = system.attributes;
		const abilities = system.abilities;

		// const systemClone = actorData.system.deepClone();
		// Loop de Atributos
		for (let [abilityKey, ability] of Object.entries(abilities)) {
			// Soma de bônus em atributos
			ability.tbonus = ability.value + ability.bonus;

			// Perícias Gerais
			for (let [skillKey, skill] of Object.entries(system.skills.geral)) {				
				if (skill.ability == abilityKey) {
					// Soma de bônus em perícias
					skill.tbonus = skill.value + skill.bonus;
					// Recuperação do atributo correspondente e divisão por dois.
					if (skillKey == "voo") skill.abilityValue = ability.tbonus;
					else skill.abilityValue = ability.tbonus / 2;
					// Soma do atributo derivado + total derivado.
					skill.total = Math.round(skill.abilityValue + skill.tbonus);

					// Perícia para Iniciativa
					if (attributes.init.skill == skillKey) {
						attributes.init.total = skill.total;
					}
				}
			}
		}

		for (let [abilityKey, ability] of Object.entries(abilities)) {

			// Perícias Sociais
			for (let [skillKey, skill] of Object.entries(system.skills.social)) {
				if (skill.custom == abilityKey) {
					// Recuperação do atributo correspondente e divisão por dois.
					skill.customValue = Math.round(ability.tbonus / 2);
				} 
				if (skill.custom == "arte") {
					skill.customValue = Math.round(system.skills.geral.arte.total / 2);
				}

				if (skill.ability == abilityKey) {
					// Soma de bônus em perícias
					skill.tbonus = skill.value + skill.bonus;
					skill.total = ability.tbonus + skill.tbonus + skill?.customValue;
				}
			}

		// Habilidades de Combate
			for (let [cKey, c] of Object.entries(abilities.combate)) {
				// Soma de bônus em perícias
				if (c.ability == abilityKey) {
					c.total = c.base + Number(c.value) + c.bonus;
					c.total = c.total + ability.tbonus;

					// Cálculo de Esquiva
					if (attributes.reacaoEsquiva.combatAbility == cKey) {
						attributes.reacaoEsquiva.total = c.total;
						attributes.reacaoEsquiva.total += attributes.reacaoEsquiva.value;
						attributes.reacaoEsquiva.total += attributes.reacaoEsquiva.bonus;
						attributes.reacaoEsquiva.total += attributes.reacaoEsquiva.variavel;
					}
				}
			}

			// Cálculo de Iniciativa
			if (attributes.init.ability == abilityKey) {
				attributes.init.total += ability.tbonus;
				attributes.init.total += attributes.init?.value;
				attributes.init.total += attributes.init?.bonus;
			}

			// Deslocamento
			if (attributes.movement.ability == abilityKey) {
				attributes.movement.andar += attributes.movement.base;
				attributes.movement.andar = attributes.movement.andar + ability.tbonus / attributes.movement.divisor;
				attributes.movement.andar += attributes.movement.bonus;
				attributes.movement.andar = Math.round(attributes.movement.andar);
			}
		}

		for (let [skillKey, skill] of Object.entries(system.skills.geral)) {				
			if (skill.ability == "arte") {
				skill.abilityValue = system.skills.geral.arte.total;
				skill.tbonus = skill.bonus + skill.value;
				skill.total = Math.round(skill.abilityValue + skill.tbonus);
			}
		}

		this._sizeCalculations(system);

		// Vitalidade e Chakra
		attributes.vitalidade.max = 10 + 3*abilities.vig.tbonus + 5*details.nivelCampanha + attributes.vitalidade.bonus;
		attributes.chakra.max = 10 + 3*abilities.esp.tbonus + attributes.chakra.bonus;
	}

	_prepareNPCDerived(actorData) {
		const system = actorData.system;
		const details = system.details;
		const attributes = system.attributes;
		const abilities = system.abilities;

		// Loop de Atributos
		for (let [abilityKey, ability] of Object.entries(abilities)) {
			// Soma de bônus em atributos
			if (abilityKey !== 'combate') ability.tbonus = ability.value + ability.bonus;
		}

		for (let [skillKey, skill] of Object.entries(system.skills.geral)) {
			skill.tbonus = skill.value + skill.bonus;
		}

		for (let [skillKey, skill] of Object.entries(system.skills.social)) {
			skill.tbonus = skill.value + skill.bonus;
		}

		// Habilidades de Combate
		for (let [cKey, c] of Object.entries(abilities.combate)) {
			c.tbonus = c.value + c.bonus;
			if (cKey == 'E') c.tbonus += 9; 
		}

		// Cálculo de Iniciativa
		attributes.init.tbonus = attributes.init.value + attributes.init.bonus;
	}

	_sizeCalculations(system) {
		const size = system.details.tamanho;
		switch (size) {
			case "minusculo":
				system.skills.geral.furtividade.total += 5;
				system.skills.social.intimidacao.total += -2;
				system.attributes.movement.andar += -12;
				system.abilities.vig.tbonus += -7;
				system.abilities.for.tbonus += -7;
			break;
			case "diminuto":
				system.skills.geral.furtividade.total += 3;
				system.skills.social.intimidacao.total += -2;
				system.attributes.movement.andar += -9;
				system.abilities.vig.tbonus += -5;
				system.abilities.for.tbonus += -5;
			break;
			case "miudo":
				system.skills.geral.furtividade.total += 2;
				system.skills.social.intimidacao.total += -1;
				system.attributes.movement.andar += -6;
				system.abilities.vig.tbonus += -3;
				system.abilities.for.tbonus += -3;
			break;
			case "pequeno":
				system.skills.geral.furtividade.total += 1;
				system.skills.social.intimidacao.total += -1;
				system.attributes.movement.andar += -3;
				system.abilities.vig.tbonus += -1;
				system.abilities.for.tbonus += -1;
			break;
			case "grande":
				system.skills.geral.furtividade.total += -1;
				system.skills.social.intimidacao.total += 1;
				system.attributes.movement.andar += 3;
				system.abilities.vig.tbonus += 1;
				system.abilities.for.tbonus += 1;
			break;
			case "enorme":
				system.skills.geral.furtividade.total += -2;
				system.skills.social.intimidacao.total += 1;
				system.attributes.movement.andar += 6;
				system.abilities.vig.tbonus += 3;
				system.abilities.for.tbonus += 3;
			break;
			case "imenso":
				system.skills.geral.furtividade.total += -3;
				system.skills.social.intimidacao.total += 2;
				system.attributes.movement.andar += 9;
				system.abilities.vig.tbonus += 5;
				system.abilities.for.tbonus += 5;
			break;
			case "colossal":
				system.skills.geral.furtividade.total += -5;
				system.skills.social.intimidacao.total += 2;
				system.attributes.movement.andar += 12;
				system.abilities.vig.tbonus += 7;
				system.abilities.for.tbonus += 7;
			break;
			case "incrivel":
				system.skills.geral.furtividade.total += -7;
				system.skills.social.intimidacao.total += 3;
				system.attributes.movement.andar += 15;
				system.abilities.vig.tbonus += 9;
				system.abilities.for.tbonus += 9;
			break;
		}
	}

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    // Starts off by populating the roll data with `this.system`
    const data = { ...super.getRollData() };

    // Prepare character roll data.
    this._getCharacterRollData(data);

    return data;
  }

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		await super._preUpdate(changed, options, user);
		if (!game.settings.get('shinobinosho', 'changeSizeOfTokensDynamically')) return;
		// Apply changes in Actor Size to Token Width and Height.
		const newSize = foundry.utils.getProperty(changed, "system.details.tamanho");
		if (newSize) {
			const size = CONFIG.shinobiNoSho.tokenSizes[newSize];
			if (!foundry.utils.hasProperty(changed, "prototypeToken.width")) {
				changed.prototypeToken = changed.prototypeToken || {};
				changed.prototypeToken.height = size;
				changed.prototypeToken.width = size;
				this.getActiveTokens().forEach((x) => {
					x.document.update({
						"width": size,
						"height": size
					});
				});
			}
		}
	}

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    // if (this.type !== 'Ninja') return;
		data.rollIniciativa = "1d8 + " + (data.attributes.init.total || data.attributes.init.tbonus);
  }
}
