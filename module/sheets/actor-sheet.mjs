import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class npqv1ActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["npqv1", "sheet", "actor"],
      template: "systems/npqv1/templates/actor/actor-pj-sheet.html",
      width: 655,
      height: 519,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    console.log("NPQv1 | ouvre : systems/npqv1/templates/actor/actor-"+this.actor.data.type+"-sheet.html");
    return `systems/npqv1/templates/actor/actor-${this.actor.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.data.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.data;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'pj') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'pnj') {
      this._prepareItems(context);
    }

    for (let att in context.data.attributs) {
        context.data.attributs[att].code = att;
    }
    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);
    context.AttribV = { "for":"Force", "ag":"Agilité", "con":"Constitution", "p":"Présence", "ig":"Intelligence", "it":"Intuition", "v":"Volonté" };
    context.LstDes = { "D300":"D300", "D250":"D250","D200":"D200","D150":"D150","D120":"D120","D100":"D100","D80":"D80","D60":"D60","D50":"D50","D40":"D40"}
    console.log("NPQv1| context:");
    console.log(context)
    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    // for (let [k, v] of Object.entries(context.data.attributs)) {
      // v.label = game.i18n.localize(CONFIG.NPQV1.attributs[k]) ?? k;
    // }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const domaines = [];
    const competences = [];
    const secrets = [];
    const ArmesResum = [];
    const spells = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'domaine') {
        // on lui ajoute le résumé (pour l'instant jusqu'au premier point)
        i.data.descRapide = (i.data.description+".").substring(0,i.data.description.indexOf("."));
        domaines.push(i);
      } 
      else if (i.type === 'competence'){
        i.data.descRapide = (i.data.description+".").substring(0,i.data.description.indexOf("."))
        if(i.data.idLien != ""){
          // calcul si spécialisation
          let it = context.actor.items.get(i.data.idLien);
          i.data.scoreRel = i.data.score + it.data.data.score;
        }else {
          i.data.scoreRel = i.data.score;
        }
        
        competences.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      else if (i.type === 'secret') {
        if(i.data.niveau >0 && i.data.niveau < i.data.niveauMax) {
          i.data.nomMax = i.data["niv"+i.data.niveau].nom;  
        } else  i.data.nomMax = "";""
        secrets.push(i);
      }
      // ajouter dans les résumés des armes
      else if( i.type === 'arme_resum'){
        i.data.descRapide = (i.data.special+".").substring(0,i.data.description.indexOf('.'));
        i.data.NomAffiche = "";
        if(i.data.desync == 0) {
          i.data.score = 0;
          i.data.jetinit = "";
          i.data.degat ="";
          i.data.bris = -1;
        }
        if(i.data.idarmeref !== "") {
          let a = context.items.get(i.data.idarmeref);
          if(a !== undefined){
            // si synchro alors on ajouter les bonus 
            i.data.NomAffiche = a.name;
            if(i.data.desync == 0) {
              if(a.data.initiative ===""){
                i.data.jetinit = a.data.data.pinitdes + "+ (" +a.data.bonus.pinit +")";
              } else {
                i.data.jetinit = a.data.data.initiative; // l'initiative de l'arme modifié
              }
              i.data.score = i.data.score + a.data.data.bonus.score;
              i.data.bris = a.data.data.bris; // a mettre dans objet
              i.data.resistance = a.data.data.resistance // a metrte dans objet
              i.degat = a.data.data.dommage ;
              if(a.data.data.bonus.dommage !="+0") i.degat = i.degat + " +("+a.data.data.bonus.dommage+")";
            }
          } 
        }
        if(i.data.idcmpref){
          let c = context.items.get(i.data.idarmeref);
          if(c !== undefined){
            i.data.NomAffiche = i.data.NomAffiche + "("+c.name+")";
            i.data.BPro = c.data.data.BPro;
            // calcul
            if(i.data.desync == 0) {
              i.data.score = i.data.score + c.data.data.score;
            }    
          } 
        }
        ArmesResum.push(i);
      }
      // Append to spells.
      else if (i.type === 'sort') {
        i.data.descRapide = (i.data.description+".").substring(0,i.data.description.indexOf("."))
        if(i.data.idLien != ""){
          // calcul si spécialisation
          let it = context.actor.items.get(i.data.idLien);
          i.data.scoreRel = i.data.score + it.data.data.score;
        }else {
          i.data.scoreRel = i.data.score;
        }
        if (i.data.niveau != undefined) {
          spells[i.data.niveau].push(i);
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.domaines = domaines;
    context.competences = competences;
    context.secrets = secrets;
  }


  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `Nouveau ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[Attribut] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

}
