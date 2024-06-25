import {
  MODULE_NAME,
  SETTING_ONLY_NAV_SCENES,
  SETTING_REGION_ICONS
} from './region-constants.js';

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

})