// RegionBehavior.dataModels.teleportToken = foundry.data.regionBehaviors.TeleportTokenRegionBehaviorType
// field is `system.destination` : DocumentUUIDField
// form#RegionBehaviorConfig-Scene
// DocumentUUIDField is created by foundry.applications.elements.HTMLDocumentTagsElement.create(config);
//
// SetField#_toInput(config): if (this.element instanceof DocumentUUIDField) return foundry.applications.elements.HTMLDocumentTagsElement

// HTMLDocumentTagsElement#_buildElements
//   this._value = { region-uuid: "region name" }

import { libWrapper } from './lib/libwrapper-shim.js'

import { MOD, SETTING_ONLY_NAV_SCENES } from './easy-regions.js';

const REGION_DATALIST_NAME = "region-uuids";
const SPACING = " \u{2794} ";

function my_HTMLDocumentTagsElement_buildElements(wrapper) {
  const result = wrapper();

  let datalist;
  function addOption(doc, label) {
    if (!datalist) datalist = document.createElement('datalist');
    const option = document.createElement('option');
    option.value = doc.uuid;
    option.label = label || doc.name;
    datalist.append(option);
  }
  function sorted(collection) {
    return [...collection].sort((a, b) => a.name.compare(b.name));
  }
  function scenes() {
    return sorted(game.settings.get(MOD.id, SETTING_ONLY_NAV_SCENES) ? game.scenes.filter(scene => scene.navigation) : game.scenes);
  }

  const type = this.getAttribute("type");
  if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | buildElements: ${type}`);

  switch (type) {
    case "Region":
      scenes().forEach(scene =>
        sorted(scene.regions).forEach(region =>
          addOption(region, `${scene.name}${SPACING}${region.name}`)));
      break;

    case "Macro":
      sorted(game.macros).forEach(macro =>
        addOption(macro));
      break;

    case "Scene":
      scenes().forEach(scene =>
        addOption(scene));
      break;

    case "RegionBehavior":
      scenes().forEach(scene =>
        sorted(scene.regions).forEach(region =>
          sorted(region.behaviors).forEach(behavior =>
            addOption(behavior, `${scene.name}${SPACING}${region.name}${SPACING}${behavior.name}`))));
      break;
  }

  if (datalist) {
    const input = result.find(node => node.nodeName === "INPUT");
    datalist.id = REGION_DATALIST_NAME;
    input.append(datalist);
    input.setAttribute("list", REGION_DATALIST_NAME);
  }

  return result;
}


export function initRegionUUIDField() {
  libWrapper.register(MOD.id,
    'foundry.applications.elements.HTMLDocumentTagsElement.prototype._buildElements',
    my_HTMLDocumentTagsElement_buildElements,
    libWrapper.WRAPPER);
  console.log(`${MOD.title} | HTMLDocumentTagsElement._buildElements hook installed`);
}