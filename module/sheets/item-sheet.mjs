/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class npqv1ItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["npqv1", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/npqv1/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    console.log("NPQV1"+path+"/item-"+this.item.data.type+"-sheet.html" );
    return `${path}/item-${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item.data;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    context.A1Acteur = false;
    context.NomCmpV =  "";
    context.NomCode = "";
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
      let lesDomaines = actor.data.items.filter(item => item.type === "domaine");
      let lesCmp = actor.data.items.filter(item => item.type === "competences");
      let CmpV = new Object();
      CmpV[""]="aucune";
      for( let dom of lesDomaines){
        CmpV[dom.data._id] = dom.data.data.code;
      }
      for( let cmp of lesCmp){
        CmpV[cmp.data._id] = cmp.data.data.code;
      }
      context.CmpV = CmpV;
      if(context.data.data.idLien===undefined) context.data.data.idLien = "";
      if(context.data.data.idLien !=="") {
        let it =actor.data.items.get(context.data.data.idLien);
        context.NomCmp = it.name ;
        context.NomCode = it.data.data.code ;
      }
      context.A1Acteur = true;
    }

    if(context.data.type == "secret") { // utilise editor
      if(itemData.data.description == "") itemData.data.description= "initialiser<br> et 1<br> et 2<br>et 3<br>";
      for(let i = 1; i < itemData.data.niveauMax; i++ ) {
        if(itemData.data["niv"+i].description == "") itemData.data["niv"+i].description= "initialiser<br> et 1<br> et 2<br>et 3<br>";  
        if(itemData.data["niv"+i].effet == "") itemData.data["niv"+i].effet= "initialiser<br> et 1<br> et 2<br>et 3<br>";  
      }
    }
    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = itemData.data;
    context.flags = itemData.flags;
    context.AttribV = { "for":"Force", "ag":"Agilité", "con":"Constitution", "p":"Présence", "ig":"Intelligence", "it":"Intuition", "v":"Volonté" };
//    data.TypeValue = persodata.type; 
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}
