// The addition or deletion of a RegionBehavior does not trigger a render of the Region Legend window.

import { MOD } from './easy-regions.js';

export function initRegionPanel() {

  console.log(`${MOD.title} | Region Panel initialising`);

  Hooks.on('renderRegionLegend', function (app, html) {
    for (const button of html.querySelectorAll('button.icon[data-action="config"')) {
      const region = canvas.scene.regions.get(button.parentNode.dataset.regionId);
      if (!region.behaviors.size) button.classList.add('nobehaviors')
    }
  })

  Hooks.on('createRegionBehavior', async function (app, context, id) {
    // If behavior count has changed from 0, then redraw list of regions
    if (context?.parent?.behaviors.size === 1 && canvas.regions.active) {
      if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | Updating Region Legends due to first Behavior created for a region`)
      canvas.regions.legend.render();
    }
  })

  Hooks.on('deleteRegionBehavior', async function (app, context, id) {
    if (context?.parent?.behaviors.size === 0 && canvas.regions.active) {
      if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | Updating Region Legends due to last Behavior deleted for a region`)
      canvas.regions.legend.render();
    }
  })

  console.log(`${MOD.title} | Region Panel initialised`);
}