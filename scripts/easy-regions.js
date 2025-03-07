export let MOD;

export const SETTING_DROPDOWN_UUID = "dropdownUUIDs";
export const SETTING_CUSTOM_DROPDOWN = "customDropdown";
export const SETTING_ONLY_NAV_SCENES = "onlyNavigatableScenes";
export const SETTING_REGION_ICONS = "regionIcons";
export const SETTING_LEGEND_BEHAVIOR = "legendShowNoBehavior";
export const SETTING_TELEPORT_AUTOLINK = "autoLinkTeleport";
export const SETTING_TELEPORT_PATTERN1 = "teleportPattern1";
export const SETTING_TELEPORT_PATTERN2 = "teleportPattern2";
export const SETTING_TELEPORT_SAME_NAME = "teleportSameName";
export const SETTING_TELEPORT_PROMPT = "teleportPrompt";
export const SETTING_TRIGGER_ON_CLICK = "triggerOnClick";
export const SETTING_CLICK_LEFT1  = "triggerClickLeft1";
export const SETTING_CLICK_LEFT2  = "triggerClickLeft2";
export const SETTING_CLICK_RIGHT1 = "triggerClickRight1";
export const SETTING_CLICK_RIGHT2 = "triggerClickRight2";


import { initRegionUUIDField } from './region-uuids.js';
import { initRegionLinkTeleport } from './region-link-teleport.js';
import { initRegionIcons } from './region-icons.js';
import { initRegionPanel } from './region-panel.js';
import { initTeleportPrompt } from './region-teleport-prompt.js';
//import { initClickEvents } from './region-click.js';


export function relevantScenes() {
  if (game.settings.get(MOD.id, SETTING_ONLY_NAV_SCENES))
    return game.scenes.filter(scene => scene.navigation)
  else
    return game.scenes;
}

function init_settings() {

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

  game.settings.register(MOD.id, SETTING_CUSTOM_DROPDOWN, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_CUSTOM_DROPDOWN}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_CUSTOM_DROPDOWN}.Hint`),
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

  game.settings.register(MOD.id, SETTING_TELEPORT_SAME_NAME, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_TELEPORT_SAME_NAME}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_TELEPORT_SAME_NAME}.Hint`),
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

  game.settings.register(MOD.id, SETTING_TELEPORT_PROMPT, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_TELEPORT_PROMPT}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_TELEPORT_PROMPT}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    requiresReload: true
  });

/*
  game.settings.register(MOD.id, SETTING_TRIGGER_ON_CLICK, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_TRIGGER_ON_CLICK}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_TRIGGER_ON_CLICK}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  let region_options = { none: ""};
  for (const [key,value] of Object.entries(CONST.REGION_EVENTS)) {
    region_options[value] = key;
  }

  game.settings.register(MOD.id, SETTING_CLICK_LEFT1, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_CLICK_LEFT1}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_CLICK_LEFT1}.Hint`),
    scope: "world",
    type: String,
    default: "",
    choices: region_options,
    config: true,
    requiresReload: true
  });

  game.settings.register(MOD.id, SETTING_CLICK_LEFT2, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_CLICK_LEFT2}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_CLICK_LEFT2}.Hint`),
    scope: "world",
    type: String,
    default: "",
    choices: region_options,
    config: true,
    requiresReload: true
  });

  game.settings.register(MOD.id, SETTING_CLICK_RIGHT1, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_CLICK_RIGHT1}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_CLICK_RIGHT1}.Hint`),
    scope: "world",
    type: String,
    default: "",
    choices: region_options,
    config: true,
    requiresReload: true
  });

  game.settings.register(MOD.id, SETTING_CLICK_RIGHT2, {
    name: game.i18n.localize(`${MOD.id}.${SETTING_CLICK_RIGHT2}.Name`),
    hint: game.i18n.localize(`${MOD.id}.${SETTING_CLICK_RIGHT2}.Hint`),
    scope: "world",
    type: String,
    default: "",
    choices: region_options,
    config: true,
    requiresReload: true
  });
*/

  console.log(`${MOD.title} | Game Settings Registered`);

  if (game.settings.get(MOD.id, SETTING_TELEPORT_PROMPT)) initTeleportPrompt();

  console.groupEnd();
}

function init_canvas() {
  console.group(`${MOD.title} | init-canvas`);

  if (game.settings.get(MOD.id, SETTING_DROPDOWN_UUID)) initRegionUUIDField();
  if (game.settings.get(MOD.id, SETTING_TELEPORT_AUTOLINK) || game.settings.get(MOD.id, SETTING_TELEPORT_SAME_NAME)) initRegionLinkTeleport();
  if (game.settings.get(MOD.id, SETTING_REGION_ICONS)) initRegionIcons();
  if (game.settings.get(MOD.id, SETTING_LEGEND_BEHAVIOR)) initRegionPanel();

  //if (game.settings.get(MOD.id, SETTING_TRIGGER_ON_CLICK)) initClickEvents();
  console.groupEnd();
}

Hooks.on("init", init_settings);
// Needs to be canvasInit for initClickEvents to work on first scene
Hooks.once('canvasInit', init_canvas);