import {
  MOD,
  SETTING_TELEPORT_PATTERN1,
  SETTING_TELEPORT_PATTERN2,
  SETTING_ONLY_NAV_SCENES
} from './easy-regions.js';

const BEHAVIOUR_TYPE = "teleportToken";

function findOtherRegion(name) {

  const pattern1 = game.settings.get(MOD.id, SETTING_TELEPORT_PATTERN1);
  const pattern2 = game.settings.get(MOD.id, SETTING_TELEPORT_PATTERN2);
  const all_scenes = !game.settings.get(MOD.id, SETTING_ONLY_NAV_SCENES);

  const pattern1_regexp = pattern1.replace("$1", "(.*?)").replace("$2", "(.*)");
  const pattern2_regexp = pattern2.replace("$1", "(.*?)").replace("$2", "(.*)");

  function compare(orig_regexp, other_pattern) {
    const match = name.match(orig_regexp);
    if (match?.length === 3) {
      const othername = other_pattern.replace("$1", match[2]).replace("$2", match[1]);
      if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | new Teleport in '${name}': Looking for region with name '${othername}'`);

      for (const scene of game.scenes) {
        if (all_scenes || scene.navigation) {
          for (const region of scene.regions) {
            if (region.name == othername) {
              return region;
            }
          }
        }
      }
    }
    return undefined;
  }

  return compare(pattern1_regexp, pattern2) ||
    compare(pattern2_regexp, pattern1);
}


export function initRegionLinkTeleport() {

  Hooks.on('createRegionBehavior', async function (app, context, id) {
    if (app.type !== BEHAVIOUR_TYPE) return;

    const thisRegion = app.region;
    const otherRegion = findOtherRegion(thisRegion.name);
    if (!otherRegion) return;

    if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | createRegionBehavior: found other region '${otherRegion.name}'`)

    let otherBehavior = otherRegion.behaviors.find(b => b.type === BEHAVIOUR_TYPE);
    if (!otherBehavior) {
      if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | Creating new Teleport behavior on region '${otherRegion.name}' to link to '${thisRegion.name}'`)
      // Creation of the other behavior will trigger this hook again,
      // and that second trigger will link the two regions together.
      return CONFIG.RegionBehavior.documentClass.create({ type: BEHAVIOUR_TYPE }, { parent: otherRegion });
    }

    if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | Updating Teleport behavior on regions '${otherRegion.name}' and '${thisRegion.name}'`)
    app.update({ "system.destination": otherRegion.uuid })
    otherBehavior.update({ "system.destination": thisRegion.uuid })
  })
}