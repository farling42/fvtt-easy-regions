// RegionBehavior.dataModels.teleportToken = foundry.data.regionBehaviors.TeleportTokenRegionBehaviorType
// field is `system.destination` : DocumentUUIDField
// form#RegionBehaviorConfig-Scene
// DocumentUUIDField is created by foundry.applications.elements.HTMLDocumentTagsElement.create(config);
//
// SetField#_toInput(config): if (this.element instanceof DocumentUUIDField) return foundry.applications.elements.HTMLDocumentTagsElement

// HTMLDocumentTagsElement#_buildElements
//   this._value = { region-uuid: "region name" }

import { libWrapper } from './lib/libwrapper-shim.js'

const MODULE_NAME = "easy-regions";
const REGION_DATALIST_NAME = "region-uuids";
const SPACING = " \u{2794} ";
const SETTING_ONLY_NAV_SCENES = "onlyNavigatableScenes";


function sorted(collection) {
  return [...collection].sort((a, b) => a.name.compare(b.name));
}
function addOption(datalist, doc, label) {
  const option = document.createElement('option');
  option.value = doc.uuid;
  option.label = label || doc.name;
  datalist.append(option);
}

function my_HTMLDocumentTagsElement_buildElements(wrapper) {
  let result = wrapper();

  let datalist;
  let only_nav_scenes = game.settings.get(MODULE_NAME, SETTING_ONLY_NAV_SCENES);

  const type = this.getAttribute("type");
  console.log(`${MODULE_NAME}.buildElements | ${type}`);
  if (type === 'Region') {
    for (const scene of sorted(game.scenes)) {
      if (!only_nav_scenes || scene.navigation)
        for (const region of sorted(scene.regions)) {
          if (!datalist) datalist = document.createElement('datalist');
          addOption(datalist, region, `${scene.name}${SPACING}${region.name}`);
        }
    }
  } else if (type === 'Macro') {
    for (const macro of sorted(game.macros)) {
      if (!datalist) datalist = document.createElement('datalist');
      addOption(datalist, macro);
    }
  } else if (type === 'Scene') {
    for (const scene of sorted(game.scenes)) {
      if (!only_nav_scenes || scene.navigation) {
        if (!datalist) datalist = document.createElement('datalist');
        addOption(datalist, scene);
      }
    }
  } else if (type === "RegionBehavior") {
    for (const scene of sorted(game.scenes)) {
      if (!only_nav_scenes || scene.navigation)
        for (const region of sorted(scene.regions)) {
          for (const behavior of sorted(region.behaviors)) {
            if (!datalist) datalist = document.createElement('datalist');
            addOption(datalist, behavior, `${scene.name}${SPACING}${region.name}${SPACING}${behavior.name}`);
          }
        }
    }
  }

  if (datalist) {
    const [tags, input, button] = result;
    datalist.id = REGION_DATALIST_NAME;
    input.append(datalist);
    input.setAttribute("list", REGION_DATALIST_NAME);
  }

  return result;
}

Hooks.once('ready', async function () {
  libWrapper.register(MODULE_NAME,
    'foundry.applications.elements.HTMLDocumentTagsElement.prototype._buildElements',
    my_HTMLDocumentTagsElement_buildElements,
    libWrapper.WRAPPER);
  console.log(`${MODULE_NAME} | hooks installed`)

  game.settings.register(MODULE_NAME, SETTING_ONLY_NAV_SCENES, {
    name: game.i18n.localize(`${MODULE_NAME}.${SETTING_ONLY_NAV_SCENES}.Name`),
    hint: game.i18n.localize(`${MODULE_NAME}.${SETTING_ONLY_NAV_SCENES}.Hint`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });
})
