import { MOD } from './easy-regions.js';

import { default as EasyTeleportTokenRegionBehaviorType } from './easy-teleport-token.mjs';

export function initTeleportPrompt() {

  console.log(`${MOD.title} | Teleport Region Prompts Initialising`);

  CONFIG.RegionBehavior.dataModels.teleportToken = EasyTeleportTokenRegionBehaviorType;

  Hooks.on("ready", () => {
    console.log(`${MOD.title} | Teleport Region Event Initialising`);
    CONFIG.queries.confirmTeleportToken = EasyTeleportTokenRegionBehaviorType._confirmQuery
    console.log(`${MOD.title} | Teleport Region Event Initialised`);
  });
  
  console.log(`${MOD.title} | Teleport Region Prompts Initialised`);
}