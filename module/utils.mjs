export function simpleChatMessage(monTexte="coucou", qui=game.user){
    let chatData = {
        user: game.user._id,
        speaker: qui,
        content : monTexte
    };
    ChatMessage.create(chatData);

}
export function ScoreTot(actor, item) {
/** 
 * retourne récursivement le score pour l'item de type competence
 * 
 */
  let scoreTot = 0;
  if (item.type == "arme_resum") {
    if(item.data.idarmeref != "") {
      // recuperer le bonus de l'arme s'il exite, non récussif
      let it = actor.items.get(item.data.idarmeref);
      scoreTot += it.data.data.bonus.score;
    }
    if(item.data.idcmpref != "") {
      // recupéré le scopre de la compétence, récurcif
      let it = actor.items.get(item.data.idcmpref);
      scoreTot += ScoreTot(actor, it.data);
    }
  }
  else if (item.type == "competence") {
    scoreTot += item.data.score;
    if(item.data.idLien !=""){
      let it = actor.items.get(item.data.idLien);
      scoreTot += ScoreTot(actor, it.data); // une hauteur de plus !!
    }
  } 
  else if (item.type == "domaine") { // recup non récurcive
    scoreTot += item.data.score;

  }
  return scoreTot;
}

export function SimpleLancerSousCmp(LActeur, item, qui = game.user) {
/**
 * lance le dé est créer un texte d'évaluation 
 * LActeur : l'acteur directement
 * Item : l'item (attention : item.data pas celui du dessu)
 * retourne un objet : { resultat roll, la chaine d'évaluation, score, le dé, le nom}
 */

// exemple de code 
  //lstd[i] =r.terms[0].results[i].result;
  let attr = LActeur.data.data.attributs[item.data.attributd].value
  let scoreTot =ScoreTot(LActeur, item);
 // let desTrouve = attr;
 // let valeurBase = parseInt(attr.substring(1));
  let txtNom = item.name;
  return lancerJet(txtNom, attr, scoreTot);
}

export function lanceDommage(reussite, degat, qui) {
  let text = "";
  switch(reussite) {
    case 7: // critique 2xmax dommage
      text = "les dommages <b>sont max</b>, l'armure de la <b>cible</b> est <b>au minimum</b>.";
      degat = DegatMax(degat);
      break;
    case 6: // 2 fois les dommages
      text = "les dommages <b>sont max</b>, l'armure de la cible protège normalement";
      degat = DegatMax(degat);
      break;
    case 5:
    case 4: // cas normal
      text = "dommages normaux";
      break;
    case 3:
    case 2:
    case 1:
    default : 
    text = "pas de dommages";
    degat = "";
    break;
  }
  if(degat != ""){ // il faut faire les dommages
    let r = new Roll(degat);
    r.evaluate({async :false }); 
    let resultat = parseInt(r.result);
    text = text+'<div class="dice-roll"><div class="dice-result"><div class="dice-formula">'+degat +'</div><h4 class="dice-total">'+resultat+'</h4></div></div></div>';
  simpleChatMessage(text,qui); 
  }
}

export function lancerJet(txtNom, attr, scoreTot,  qui = game.user) {
  // rajouter un paramètre pour gerer le nom, il faut aussi gerer qui
  let r = new Roll(attr);
  let codeRet = 0;
  let valeurBase = parseInt(attr.substring(1)); // on enlève D du Dxy0
  r.evaluate({async :false });
  let resultat = parseInt(r.result); // a corriger
  let txtEval = "petit texte";
  if( resultat <= scoreTot/10) {
      // réussite critique
      txtEval = "Bravo ! <b>Réussite Critique</b> !!";
      codeRet = 7;
  } else if( resultat <= scoreTot*0.4) {
     // resusite spéciale
     txtEval = "Pas Mal ! <b>Réussite Spéciale</b> !!";
     codeRet = 6;
  } else if (resultat <= scoreTot-10) {
    // réussite normal
    if(resultat <= (valeurBase - (valeurBase * 0.05))) {
      txtEval = "Normal ! <b>Réussite Normal</b> !!";
      codeRet = 5;
    } else {
      txtEval = "Normal ! <b>Echec normal</b> !!";
      codeRet = 2;
    }
  } else if(resultat <= scoreTot) {
    // juste réussit  
    if(resultat <= (valeurBase - (valeurBase * 0.05))) {
      txtEval = "Ouf ! <b>Juste Réussi</b> !!";
      codeRet = 4;
    } else {
      txtEval = "Normal ! <b>Echec normal</b> !";
      codeRet = 2;
    }
  } else if(resultat <= scoreTot+10) {
      //juste raté
      if(resultat <= (valeurBase - (valeurBase * 0.05))) {
        txtEval = "Aîe ! <b>juste raté</b> !!";
        codeRet = 3;
      } else {
        txtEval = "Trop mauvais ! <b>Echec Critique</b> !!";
        codeRet = 1;
      }
  } else if(resultat <= (valeurBase - (valeurBase * 0.05))) {
    txtEval = "Hum ! <b>Echec Normal</b> !";
    codeRet = 2;
  } else {
     //echec critique
    txtEval = "Trop mauvais ! <b>Echec Critique</b> !";
    codeRet = 1;
  }
  // tester l'echec critique ici et modifier en echec si réussit (codeRet > 3)
  txtEval = txtEval+'<div class="dice-roll"><div class="dice-result"><div class="dice-formula">Jet sous '+attr+'  pour '+   scoreTot +'</div><h4 class="dice-total">'+resultat+'</h4></div></div></div>';
  simpleChatMessage(txtEval,qui);
  //if(dommageFormule === undefined) dommageFormule =""; // protection contre une formule non définie
  // ajout du calcul de marge d'effet (modulo)
  let margeEffe = Math.floor((scoreTot-resultat)/10);
  txtEval = "Marge effet : "+ margeEffe;
  simpleChatMessage(txtEval,qui);
  return { "roll":r, "eval":txtEval, "score":scoreTot, "des": attr, "nom":txtNom, "Code":codeRet };
}

export function DegatMax(degat) {
  let vc = degat.toUpperCase().split("D");
  let formule = "";
  if(Array.isArray(vc)) {
    formule = "(" + vc[0];
    for(let i = 1 ; i < vc.length; i++ ) {
      if(Number.isNumeric(vc[i-1][vc[i-1].length-1]) && Number.isNumeric(vc[i][0])) {
        formule += " * " + vc[i];
      } else formule += vc[i];
    }
    formule += ")";
  } else formule = degat;
  return formule;
}

function supprNombre(justeApresDes) {
  let i = 0;
  let Ret = "";
  for(i = 0; i < justeApresDes.length; i++){
    if(!Number.isNumeric(justeApresDes[i])) {
      i--;
      break;
    }
  }
  if(i < 0) {
    Ret = justApresDes;
  } else if(i < justeApresDes.length){
    Ret = justeApresDes.substring(i);
  } else {
    Ret = "";
  }
}
export function DegatMin(degat){
  let vc = degat.toUpperCase().split("D");
  let formule = "";
  if(Array.isArray(vc)) {
    formule = vc[0];
    for(let i = 1 ; i < vc.length; i++ ) {
      if(Number.isNumeric(vc[i-1][vc[i-1].length-1]) && Number.isNumeric(vc[i][0])) {
        formule += "*1" + supprNombre(vc[i]); // on enlève ce qui est entre le D et un autre caractère non numérique
      } else formule =+ vc[i];
    }
  } else formule = degat; // y a pas de dés
  return formule;
}