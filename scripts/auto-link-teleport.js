import {
  MODULE_NAME,
  SETTING_TELEPORT_AUTOLINK,
  SETTING_TELEPORT_PATTERN1,
  SETTING_TELEPORT_PATTERN2,
  SETTING_ONLY_NAV_SCENES,
  easyDebug, easyLog
} from './region-settings.js';

const BEHAVIOUR_TYPE = "teleportToken";

function getAllRegions(regexp) {
  const only_nav_scenes = game.settings.get(MODULE_NAME, SETTING_ONLY_NAV_SCENES);
  const regions = [];
  for (const scene of game.scenes) {
    if (!only_nav_scenes || scene.navigation) {
      for (const region of scene.regions) {
        if (region.name.match(regexp)) {
          regions.push(region);
        }
      }
    }
  }
  return regions;
}


function findOtherRegion(name) {

  const pattern1 = game.settings.get(MODULE_NAME, SETTING_TELEPORT_PATTERN1);
  const pattern2 = game.settings.get(MODULE_NAME, SETTING_TELEPORT_PATTERN2);

  const pattern1_regexp = pattern1.replace("$1", "(.*?)").replace("$2", "(.*)");
  const pattern2_regexp = pattern2.replace("$1", "(.*?)").replace("$2", "(.*)");
  const region_regexp_both = `(${pattern1_regexp})|(${pattern2_regexp})`;

  function compare(orig_pattern, other_pattern) {
    const match = name.match(orig_pattern);
    if (match?.length === 3) {
      const othername = other_pattern.replace("$1", match[2]).replace("$2", match[1]);
      easyDebug(`new Teleport in ${name}: Looking for region with name ${othername}`);
      return getAllRegions(region_regexp_both).find(r => r.name === othername);
    }
    return undefined;
  }

  return compare(pattern1_regexp, pattern2) ||
    compare(pattern2_regexp, pattern1);
}


export function initRegionLinkTeleport() {

  Hooks.on('createRegionBehavior', async function (app, context, id) {
    if (app.type !== BEHAVIOUR_TYPE) return;

    //easyDebug(`createRegionBehavior: type ${app.type}`, {app, context, id})  
    const thisRegion = app.region;
    const otherRegion = findOtherRegion(thisRegion.name);
    if (!otherRegion) return;

    easyDebug(`createRegionBehavior: found other region ${otherRegion.name}`)

    let otherBehavior = otherRegion.behaviors.find(b => b.type === BEHAVIOUR_TYPE);
    if (!otherBehavior) {
      easyDebug(`Creating new Teleport behavior on region '${otherRegion.name}' to link to '${thisRegion.name}'`)
      // Creation of the other behavior will trigger this hook again,
      // and that second trigger will link the two regions together.
      return CONFIG.RegionBehavior.documentClass.create({ type: BEHAVIOUR_TYPE }, { parent: otherRegion });
    }

    easyDebug(`Updating Teleport behavior on regions '${otherRegion.name}' and '${thisRegion.name}'`)
    app.update({ "system.destination": otherRegion.uuid })
    otherBehavior.update({ "system.destination": thisRegion.uuid })
  })
}