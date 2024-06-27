export const MODULE_NAME = "easy-regions";
export const MODULE_TITLE = "Easy Regions";

export const SETTING_ONLY_NAV_SCENES = "onlyNavigatableScenes";

export const SETTING_REGION_ICONS = "regionIcons";

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

  easyLog("Game Settings Registered");
})


export function easyDebug(msg, ...args) {
  if (CONFIG.debug[MODULE_NAME]) console.debug(`${MODULE_TITLE} | ${msg} `, ...args)
}

export function easyLog(msg, ...args) {
  console.log(`${MODULE_TITLE} | ${msg} `, ...args)
}