const form = `<form>
  <label>Input 1 <input name="input-1" type="string"/></label>
</form>`;

const lstDes = ["D300", "D250","D200","D150","D120","D100","D80","D60","D50","D40"];

function handleSubmit(html) {
  const formElement = html[0].querySelector('form');
  const formData = new FormDataExtended(formElement);
  const formDataObject = formData.toObject();

  // expects an object: { input-1: 'some value' }
  console.log('output form data object', formDataObject);
}

export function simpleDialogue(){
  let i = 10;
    new Dialog({
    title: "A custom dialog title",
    content: form,
    buttons: {
        submit: { label: "Submit", callback: handleSubmit },
        cancel: { label: "Cancel" },
    },
    }).render(true);
}


  /*** mon propre test sur les dialogue
   *  le premier problème faire passer les données voulu (dans l'apel de rendereTemplate, deuxièmle argument)
   */
  /**
 * Sets the form's inputs based on the selected preset.
 */
 function handleCranPreset(event) {
  const targetElement = event.currentTarget;
  const presetType = targetElement.dataset?.preset;

  const formElement = $(targetElement).parents('form');

  const scoreInput = formElement?.find('[name="score"]');
  const desInput = formElement?.find('[name="des"]');

  if (!presetType || !scoreInput || !desInput) {
    return;
  }
  let ndx = 0;
  switch (presetType) {
    case 'cranMoins':
      ndx = lstDes.indexOf(desInput[0].value) -1;
      if(ndx < 0) {
        scoreInput.val(parseInt(scoreInput.val(),10) - 20);
      } else {
        desInput.val(lstDes[ndx]);
      }
      break;

    case 'cranPlus':
      ndx = lstDes.indexOf(desInput[0].value) +1;
      if(ndx >= lstDes.length) {
        scoreInput.val(parseInt(scoreInput.val(),10) - 20);
      } else {
        desInput.val(lstDes[ndx]);
      }
      break;

    default:
      throw new Error(`Unknown preset: ${presetType}`);
      break;
  }
}

/**
 * Verify that all expected formData fields have values.
 */
function verifSyntheseData(formData) {
  if (!formData?.score) {
    throw new Error('Score is required');
  }

  if (!formData?.des) {
    throw new Error('Dés is required');
  }
  if (formData?.dommage) {
    if(formData?.dommage.toUpperCase().indexOf("D") == -1)
      throw new Error('Dommage necessite un dé');
  } 
}

/**
 * Prompt the user the dice roll
 */
 export async function  promptForLancer(txtNom, score,attribcode, deschoix, dommageFormule) {
  context = {
    AttribV : { "for":"Force", "ag":"Agilité", "con":"Constitution", "p":"Présence", "ig":"Intelligence", "it":"Intuition", "v":"Volonté" },
    LstDes : { "D300":"D300", "D250":"D250","D200":"D200","D150":"D150","D120":"D120","D100":"D100","D80":"D80","D60":"D60","D50":"D50","D40":"D40"},
    dommage: dommageFormule
  };
  context.attrbName = context.AttribV[attribcode]; // normalement le nom long du code
  context.score = score;
  context.des = deschoix;
  context.txtNom = txtNom;
  const htmlContent = await renderTemplate('systems/npqv1/templates/dialogue/jetparams.hbs', context);

  return new Promise((resolve, reject) => {
    const dialog = new Dialog({
      title: "Modificateur de lancer",
      content: htmlContent,
      buttons: {
        cancel: {
          label: "Cancel",
          callback: () => reject('User canceled.'),
        },
        submit: {
          label: "Lance...",
          icon: '<i class="fas fa-check"></i>',
          callback: (html) => {
            const formData = new FormDataExtended(html[0].querySelector('form'))
              .toObject();

              verifSyntheseData(formData);

            resolve(formData);
          },
        },
      },
      render: (html) => {
        html.on('click', 'button[data-preset]', handleCranPreset);
      },
      close: () => {
        reject('User closed dialog without making a selection.');
      },
    });

    dialog.render(true);
  });
}

// EXEMPLE A SUPPRIMER QUAND TOUT COMPRISE
/**
 * Sets the form's inputs based on the selected preset.
 */
//  function handleFruitPreset(event) {
//   const targetElement = event.currentTarget;
//   const presetType = targetElement.dataset?.preset;

//   const formElement = $(targetElement).parents('form');

//   const nameInput = formElement?.find('[name="name"]');
//   const colorInput = formElement?.find('[name="color"]');

//   if (!presetType || !nameInput || !colorInput) {
//     return;
//   }

//   switch (presetType) {
//     case 'apple':
//       nameInput.val('Apple');
//       colorInput.val('#ff0000');
//       break;

//     case 'banana':
//       nameInput.val('Banana');
//       colorInput.val('#ffff00');
//       break;

//     case 'orange':
//       nameInput.val('Orange');
//       colorInput.val('#ff7700');
//       break;

//     default:
//       throw new Error(`Unknown preset: ${presetType}`);
//       break;
//   }
// }

/**
 * Verify that all expected formData fields have values.
 */
// function verifyFruitInputs(formData) {
//   if (!formData?.name) {
//     throw new Error('Name is required');
//   }

//   if (!formData?.color) {
//     throw new Error('Color is required');
//   }
// }

/**
 * Prompt the user for traits they wish the created fruit to have.
 */
/*
 async function  promptForFruitTraits() {
  const htmlContent = await renderTemplate('systems/npqv1/templates/dialogue/handlebarsTemplate.hbs');

  return new Promise((resolve, reject) => {
    const dialog = new Dialog({
      title: "Fruit Traits",
      content: htmlContent,
      buttons: {
        submit: {
          label: "Create",
          icon: '<i class="fas fa-apple-alt"></i>',
          callback: (html) => {
            const formData = new FormDataExtended(html[0].querySelector('form'))
              .toObject();

            verifyFruitInputs(formData);

            resolve(formData);
          },
        },
        skip: {
          label: "Skip",
          callback: () => resolve(null),
        },
        cancel: {
          label: "Cancel",
          callback: () => reject('User canceled.'),
        },
      },
      render: (html) => {
        html.on('click', 'button[data-preset]', handleFruitPreset);
      },
      close: () => {
        reject('User closed dialog without making a selection.');
      },
    });

    dialog.render(true);
  });
}

export function testFruit(){
return new Promise(resolve => {
  try {
    // voir https://foundryvtt.wiki/en/development/api/dialog
    // const fruitTraits = await promptForFruitTraits(); // c'est cette ligne !
    const fruitTraits = promptForFruitTraits().then();
  
     if (!fruitTraits) {
       //console.warn('User skipped fruit creation.')
       resolve("Utilisateur a sauté l'étape") ;
     } else {
       //console.log(fruitTraits); // logs the form output
       resolve(fruitTraits);
     }
  } catch(error) {
    //console.error(error);
    resolve("ERROR");
  }
});

}
*/