import {
  MOD,
  SETTING_TELEPORT_PATTERN1,
  SETTING_TELEPORT_PATTERN2,
  SETTING_TELEPORT_AUTOLINK,
  SETTING_TELEPORT_SAME_NAME,
  relevantScenes
} from './easy-regions.js';

const BEHAVIOUR_TELEPORT_TYPE = "teleportToken";

async function my_createRegionBehavior(app, context, id) {
  if (app.type !== BEHAVIOUR_TELEPORT_TYPE) return;

  const thisRegion = app.region;
  const scenes = relevantScenes();

  let otherRegion;
  // Simple exact name comparison first
  if (game.settings.get(MOD.id, SETTING_TELEPORT_SAME_NAME)) {
    for (const scene of scenes) {
      otherRegion = scene.regions.find(region => region.name == thisRegion.name && region.id != thisRegion.id);
      if (otherRegion) break;
    }
  }

  // Complicated pattern matching second
  if (!otherRegion && game.settings.get(MOD.id, SETTING_TELEPORT_AUTOLINK)) {
    const pattern1 = game.settings.get(MOD.id, SETTING_TELEPORT_PATTERN1);
    const pattern2 = game.settings.get(MOD.id, SETTING_TELEPORT_PATTERN2);

    function compare(match_pattern, other_pattern) {
      const match = thisRegion.name.match(match_pattern.replace("$1", "(.*?)").replace("$2", "(.*)"));
      if (match?.length === 3) {
        const othername = other_pattern.replace("$1", match[2]).replace("$2", match[1]);
        if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | new Teleport in '${thisRegion.name}': Looking for region with name '${othername}'`);

        for (const scene of scenes) {
          const found = scene.regions.find(region => region.name == othername);
          if (found) return found;
        }
      }
      return undefined;
    }

    otherRegion = compare(pattern1, pattern2) || compare(pattern2, pattern1);
  }

  if (!otherRegion) return;

  if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | createRegionBehavior: found other region '${otherRegion.name}'`)

  let otherBehavior = otherRegion.behaviors.find(b => b.type === BEHAVIOUR_TELEPORT_TYPE);
  if (!otherBehavior) {
    if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | Creating new Teleport behavior on region '${otherRegion.name}' to link to '${thisRegion.name}'`)
    // Creation of the other behavior will trigger this hook again,
    // and that second trigger will link the two regions together.
    return CONFIG.RegionBehavior.documentClass.create({ type: BEHAVIOUR_TELEPORT_TYPE }, { parent: otherRegion });
  }

  if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | Updating Teleport behavior on regions '${otherRegion.name}' and '${thisRegion.name}'`)
  app.update({ "system.destination": otherRegion.uuid })
  otherBehavior.update({ "system.destination": thisRegion.uuid })
}

export function initRegionLinkTeleport() {
  console.log(`${MOD.title} | Teleport Linking Initialising`);

  Hooks.on('createRegionBehavior', my_createRegionBehavior);

  console.log(`${MOD.title} | Teleport Linking Initialised`);
}