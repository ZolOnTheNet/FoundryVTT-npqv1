export function simpleChatMessage(monTexte="coucou", qui=game.user){
    let chatData = {
        userr: game.user._id,
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
  let desTrouve = attr;
  let valeurBase = parseInt(attr.substring(1));
  let txtNom = item.name;
  return lanceAttrib(txtNom, attr, scoreTot);
}

export function CmplxLancerSousCmp(data, idItem1Attr) {
/**
 * ouvre un formulaire pour calculer le dé et le score si Ok => étapes suivante, sinon adios
 * lance le dé est créer un texte d'évaluation 
 * data : un ensemble de données type context
 * idItemAttr : soit le code d'un attribut (<5 car) soit l'uid d'un items (typiquement uid d'un arme_resume)
 * retourne un objet : { resultat roll, la chaine d'évaluation, score, le dé, le nom}
 */
 let r = new Roll("d100");
 let textEval = "petit texte";
 let scoreTot = 65;
 let desTrouve = "D100"; 
 let txtNom = "cmp";

 return { roll:r, eval:textEval, score:scoreTot, des:desTrouve, nom:txtNom};
   
}

function lanceAttrib(txtNom, attr, scoreTot) {
  let r = new Roll(attr);
  r.evaluate({async :false });
  let resultat = parseInt(r.result); // a corriger
  let txtEval = "petit texte";
  if( resultat <= scoreTot/10) {
      // réussite critique
      txtEval = "Bravo ! <b>Réussite Critique</b> !!";
  } else if( resultat <= scoreTot*0.4) {
     // resusite spéciale
     txtEval = "Pas Mal ! <b>Réussite Spéciale</b> !!";
  } else if (resultat <= scoreTot-10) {
    // réussite normal
    txtEval = "Normal ! <b>Réussite Normal</b> !!";
  } else if(resultat <= scoreTot) {
    // juste réussit  
    txtEval = "Ouf ! <b>Juste Réussi</b> !!";
  } else if(resultat <= scoreTot+10) {
      //juste raté
      txtEval = "Aîe ! <b>juste raté</b> !!";
  } else if(resultat <= (valeurBase - (valeurBase * 0.05))) {
    txtEval = "Hum ! <b>Echec Normal</b> !!";
      //echec critique
  } else {
    txtEval = "Trop mauvais ! <b>Echec Critique</b> !!";
  }
  txtEval = txtEval+'<div class="dice-roll"><div class="dice-result"><div class="dice-formula">'+item.data.attributd+': '+attr+'  pour '+   scoreTot +'</div><h4 class="dice-total">'+resultat+'</h4></div></div></div>';
  simpleChatMessage(txtEval,qui);
  return { "roll":r, "eval":txtEval, "score":scoreTot, "des": attr, "nom":txtNom};
}