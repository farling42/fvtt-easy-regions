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

function my_HTMLDocumentTagsElement_buildElements(wrapper) {
  let result = wrapper();

  let datalist;

  const type = this.getAttribute("type");
  console.log(`${MODULE_NAME}.buildElements | ${type}`);
  if (type === 'Region') {
    for (const scene of game.scenes) {
      for (const region of scene.regions) {
        if (!datalist) datalist = document.createElement('datalist');
        const option = document.createElement('option');
        option.value = region.uuid;
        option.label = `${scene.name}: ${region.name}`;
        datalist.append(option);
      }
    }
  } else if (type === 'Macro') {
    for (const macro of game.macros) {
      if (!datalist) datalist = document.createElement('datalist');
      const option = document.createElement('option');
      option.value = macro.uuid;
      option.label = macro.name;
      datalist.append(option);
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
})