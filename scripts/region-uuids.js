// RegionBehavior.dataModels.teleportToken = foundry.data.regionBehaviors.TeleportTokenRegionBehaviorType
// field is `system.destination` : DocumentUUIDField
// form#RegionBehaviorConfig-Scene
// DocumentUUIDField is created by foundry.applications.elements.HTMLDocumentTagsElement.create(config);
//
// SetField#_toInput(config): if (this.element instanceof DocumentUUIDField) return foundry.applications.elements.HTMLDocumentTagsElement

// HTMLDocumentTagsElement#_buildElements
//   this._value = { region-uuid: "region name" }

import { libWrapper } from './lib/libwrapper-shim.js'

import { MOD, SETTING_CUSTOM_DROPDOWN, relevantScenes } from './easy-regions.js';

const REGION_DATALIST_NAME = "region-uuids";
//const SPACING = " \u{2794} ";   // UNICODE: "Heavy Wide-Headed Rightwards Arrow" (Dingbats block)
const SPACING = " \u{21D2} ";   // UNICODE: "Rightwards Double Arrow" (Arrows block)

function my_HTMLDocumentTagsElement_buildElements(wrapper) {
  const result = wrapper();

  const custom = game.settings.get(MOD.id, SETTING_CUSTOM_DROPDOWN);

  let datalist;
  function addOption(doc, label) {
    if (!datalist) datalist = document.createElement('datalist');
    const option = document.createElement('option');
    if (custom) {
      option.dataset.value = doc.uuid;
      option.value = label || doc.name;
    } else {
      option.value = doc.uuid;
      option.label = label || doc.name;
    }
    datalist.append(option);
  }
  function sorted(collection) {
    return [...collection].sort((a, b) => a.name.compare(b.name));
  }

  const type = this.getAttribute("type");
  if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | buildElements: ${type}`);

  switch (type) {
    case "Region":
      sorted(relevantScenes()).forEach(scene =>
        sorted(scene.regions).forEach(region =>
          addOption(region, `${scene.name}${SPACING}${region.name}`)));
      break;

    case "Macro":
      sorted(game.macros).forEach(macro =>
        addOption(macro));
      break;

    case "Scene":
      sorted(relevantScenes()).forEach(scene =>
        addOption(scene));
      break;

    case "RegionBehavior":
      sorted(relevantScenes()).forEach(scene =>
        sorted(scene.regions).forEach(region =>
          sorted(region.behaviors).forEach(behavior =>
            addOption(behavior, `${scene.name}${SPACING}${region.name}${SPACING}${behavior.name}`))));
      break;
  }

  if (datalist) {
    let index;
    for (index = 0; index < result.length && result[index].nodeName !== 'INPUT'; index++);
    if (index === result.length) {
      console.error(`${MOD} | Failed to find 'input' element from HTMLDocumentTagsElement._buildElements`)
      return;
    }

    // Hide the default input field
    const originput = result[index];
    if (custom) originput.hidden = true;

    datalist.id = REGION_DATALIST_NAME;

    // Use our own input field
    const myinput = document.createElement('input');
    myinput.type = originput.type;
    myinput.placeholder = originput.placeholder;
    myinput.setAttribute("list", REGION_DATALIST_NAME);

    if (custom) {
      myinput.addEventListener("input", (ev) => {
        // For direct input, such as pasting a UUID into the field.
        originput.value = myinput.value;
        // Now check for one of the options being selected.
        for (const option of datalist.options) {
          if (option.value === myinput.value) {
            originput.value = option.dataset.value;
            break;
          }
        }
      })
      result.splice(index, 0, myinput, datalist);
    } else {
      originput.append(datalist);
      originput.setAttribute("list", REGION_DATALIST_NAME);
    }
  }

  return result;
}

export function initRegionUUIDField() {
  console.log(`${MOD.title} | HTMLDocumentTagsElement._buildElements wrapper installing`);

  libWrapper.register(MOD.id,
    'foundry.applications.elements.HTMLDocumentTagsElement.prototype._buildElements',
    my_HTMLDocumentTagsElement_buildElements,
    libWrapper.WRAPPER);

  console.log(`${MOD.title} | HTMLDocumentTagsElement._buildElements wrapper installed`);
}