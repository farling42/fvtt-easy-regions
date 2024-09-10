import { MOD } from './easy-regions.js';

import { default as EasyTeleportTokenRegionBehaviorType } from './easy-teleport-token.mjs';

export function initTeleportPrompt() {

  console.log(`${MOD.title} | Teleport Region Prompts Initialising`);

  Object.assign(CONFIG.RegionBehavior.dataModels, {
    teleportToken: EasyTeleportTokenRegionBehaviorType
  })

  Hooks.on("ready", () => EasyTeleportTokenRegionBehaviorType._activateSocketListeners(game.socket));

  console.log(`${MOD.title} | Teleport Region Prompts Initialised`);
}