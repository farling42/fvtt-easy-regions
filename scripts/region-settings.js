export const MODULE_NAME = "easy-regions";
export const MODULE_TITLE = "Easy Regions";

export const SETTING_ONLY_NAV_SCENES = "onlyNavigatableScenes";
export const SETTING_REGION_ICONS = "regionIcons";
export const SETTING_LEGEND_BEHAVIOR = "legendShowNoBehavior";
export const SETTING_TELEPORT_AUTOLINK = "autoLinkTeleport";
export const SETTING_TELEPORT_PATTERN1 = "teleportPattern1";
export const SETTING_TELEPORT_PATTERN2 = "teleportPattern2";

Hooks.once('ready', async function () {

  game.settings.register(MODULE_NAME, SETTING_ONLY_NAV_SCENES, {
    name: game.i18n.localize(`${MODULE_NAME}.${SETTING_ONLY_NAV_SCENES}.Name`),
    hint: game.i18n.localize(`${MODULE_NAME}.${SETTING_ONLY_NAV_SCENES}.Hint`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  game.settings.register(MODULE_NAME, SETTING_REGION_ICONS, {
    name: game.i18n.localize(`${MODULE_NAME}.${SETTING_REGION_ICONS}.Name`),
    hint: game.i18n.localize(`${MODULE_NAME}.${SETTING_REGION_ICONS}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    requiresReload: true
  });

  game.settings.register(MODULE_NAME, SETTING_LEGEND_BEHAVIOR, {
    name: game.i18n.localize(`${MODULE_NAME}.${SETTING_LEGEND_BEHAVIOR}.Name`),
    hint: game.i18n.localize(`${MODULE_NAME}.${SETTING_LEGEND_BEHAVIOR}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    requiresReload: true
  });

  game.settings.register(MODULE_NAME, SETTING_TELEPORT_AUTOLINK, {
    name: game.i18n.localize(`${MODULE_NAME}.${SETTING_TELEPORT_AUTOLINK}.Name`),
    hint: game.i18n.localize(`${MODULE_NAME}.${SETTING_TELEPORT_AUTOLINK}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register(MODULE_NAME, SETTING_TELEPORT_PATTERN1, {
    name: game.i18n.localize(`${MODULE_NAME}.${SETTING_TELEPORT_PATTERN1}.Name`),
    hint: game.i18n.localize(`${MODULE_NAME}.${SETTING_TELEPORT_PATTERN1}.Hint`),
    scope: "world",
    type: String,
    default: "$1 up to $2",
    config: true
  });

  game.settings.register(MODULE_NAME, SETTING_TELEPORT_PATTERN2, {
    name: game.i18n.localize(`${MODULE_NAME}.${SETTING_TELEPORT_PATTERN2}.Name`),
    hint: game.i18n.localize(`${MODULE_NAME}.${SETTING_TELEPORT_PATTERN2}.Hint`),
    scope: "world",
    type: String,
    default: "$1 down to $2",
    config: true
  });


  easyLog("Game Settings Registered");
})


export function easyDebug(msg, ...args) {
  //if (CONFIG.debug[MODULE_NAME]) 
    console.debug(`${MODULE_TITLE} | ${msg} `, ...args)
}

export function easyLog(msg, ...args) {
  console.log(`${MODULE_TITLE} | ${msg} `, ...args)
}