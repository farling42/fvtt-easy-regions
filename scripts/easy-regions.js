export let MOD;

export const SETTING_DROPDOWN_UUID = "dropdownUUIDs";
export const SETTING_ONLY_NAV_SCENES = "onlyNavigatableScenes";
export const SETTING_REGION_ICONS = "regionIcons";
export const SETTING_LEGEND_BEHAVIOR = "legendShowNoBehavior";
export const SETTING_TELEPORT_AUTOLINK = "autoLinkTeleport";
export const SETTING_TELEPORT_PATTERN1 = "teleportPattern1";
export const SETTING_TELEPORT_PATTERN2 = "teleportPattern2";

import { initRegionUUIDField } from './region-uuids.js';
import { initRegionLinkTeleport } from './region-link-teleport.js';
import { initRegionIcons } from './region-icons.js';
import { initRegionPanel } from './region-panel.js';

function init_module() {

  MOD = game.modules.get("easy-regions");

  console.group(`${MOD.title} | startup`);

  game.settings.register(MOD.id, SETTING_DROPDOWN_UUID, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_DROPDOWN_UUID}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_DROPDOWN_UUID}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register(MOD.id, SETTING_ONLY_NAV_SCENES, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_ONLY_NAV_SCENES}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_ONLY_NAV_SCENES}.Hint`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  game.settings.register(MOD.id, SETTING_REGION_ICONS, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_REGION_ICONS}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_REGION_ICONS}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    requiresReload: true
  });

  game.settings.register(MOD.id, SETTING_LEGEND_BEHAVIOR, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_LEGEND_BEHAVIOR}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_LEGEND_BEHAVIOR}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    requiresReload: true
  });

  game.settings.register(MOD.id, SETTING_TELEPORT_AUTOLINK, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_TELEPORT_AUTOLINK}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_TELEPORT_AUTOLINK}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register(MOD.id, SETTING_TELEPORT_PATTERN1, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_TELEPORT_PATTERN1}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_TELEPORT_PATTERN1}.Hint`),
    scope: "world",
    type: String,
    default: "$1 up to $2",
    config: true
  });

  game.settings.register(MOD.id, SETTING_TELEPORT_PATTERN2, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_TELEPORT_PATTERN2}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_TELEPORT_PATTERN2}.Hint`),
    scope: "world",
    type: String,
    default: "$1 down to $2",
    config: true
  });

  console.log(`${MOD.title} | Game Settings Registered`);

  if (game.settings.get(MOD.id, SETTING_DROPDOWN_UUID))     initRegionUUIDField();
  if (game.settings.get(MOD.id, SETTING_TELEPORT_AUTOLINK)) initRegionLinkTeleport();
  if (game.settings.get(MOD.id, SETTING_REGION_ICONS))      initRegionIcons();
  if (game.settings.get(MOD.id, SETTING_LEGEND_BEHAVIOR))   initRegionPanel();  
  console.groupEnd();
}

Hooks.once('ready', init_module);