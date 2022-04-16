/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
   // "systems/npqv1/templates/actor/parts/actor-features.html",
    "systems/npqv1/templates/actor/parts/actor-synthese.html",
    "systems/npqv1/templates/actor/parts/actor-items.html",
    "systems/npqv1/templates/actor/parts/actor-sorts.html",
    "systems/npqv1/templates/actor/parts/actor-effects.html",
    "systems/npqv1/templates/actor/parts/actor-secrets.html",
    "systems/npqv1/templates/actor/parts/actor-competences.html"
  ]);
};
