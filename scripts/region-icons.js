//
// Allow an ICON (img) to be specified for each region.
//
// Draw the region in the centre of each of the region's polygons.
//

/*
CONFIG.RegionBehavior.typeIcons[this.document.type];
CONFIG.RegionBehavior.

CONFIG.Region.documentClass = RegionDocument;
CONFIG.Region.layerClass = RegionLayer;
CONFIG.Region.objectClass = Region;
CONFIG.Region.sheetClasses = { base: { "core.RegionConfig": { cls: RegionConfig } } };  // with other stuff too
CONFIG.Region.typeLabels[behaviourType] = localization.key;

class Region extends PlaceableObject;
class RegionLayer extends PlaceablesLayer;
*/

const MODULE_NAME = "easy-regions";
const IMG_FIELD = "flags.easy-regions.img";

let icon_field;

function iconField() {
  if (icon_field) return icon_field;
  // Create a fake DataField for the image (generic)
  const options = {
    name: `${MODULE_NAME}.img`,
    categories: ["IMAGE"],
    label: `${MODULE_NAME}.regionConfig.icon.label`,
    hint: `${MODULE_NAME}.regionConfig.icon.hint`
  }
  const context = {
    name: IMG_FIELD
  }
  icon_field = new foundry.data.fields.FilePathField(options, context);
  return icon_field;
}


Hooks.on("renderRegionConfig", (doc, html) => {
  console.log(`>>> renderRegionConfig`, { doc, html })
  let section = html.querySelector('section.region-shapes');

  // Create the FormGroup to add to the form (specific)
  const groupConfig = {
    localize: true
  };
  const inputConfig = {
    placeholder: `${MODULE_NAME}.regionConfig.icon.placeholder`,
    value: doc.document.flags[MODULE_NAME]?.img,
    localize: true,
  }
  const formGroup = iconField().toFormGroup(groupConfig, inputConfig);
  section.append(formGroup);
})


Hooks.on("refreshRegion", async (region, options) => {
  // region = Region
  // option.refreshState (boolean)   Region._refreshState()
  // option.refreshBorder (boolean)  Region._refreshBorder()
  console.log(`refreshRegion:`, { region, options })
  if (options.refreshState) {

    //const {texture, iconSize} = region.document;
    const texture = {
      src: region.document.flags[MODULE_NAME]?.img,
      tint: 0xFFFFFF
    }
    const iconSize = 32;

    if (region.icons && !texture.src) {
      region.icons.destroy({ children: true })
    }
    if (!texture.src) return;

    if (!region.icons) {
      region.icons = region.addChild(new PIXI.Graphics());
      region.icons.eventMode = "none";
    }
    if (!region.iconTexture || region.iconTextureSrc != texture.src) {
      region.iconTextureSrc = texture.src;
      region.iconTexture = await loadTexture(texture.src);
      for (const icon of region.icons.children)
        icon.texture = region.iconTexture;
    }

    // Get the correct number of icons
    const oldCount = region.icons.children.length;
    const newCount = region.polygonTree.children.length;
    for (let i=oldCount; i > newCount; i--)
      region.icons.children[i-1].destroy({children:true})
    for (let i=oldCount; i<newCount; i++) {
      const icon = new PIXI.Sprite(); //ControlIcon({ texture: texture.src, size: iconSize, tint: texture.tint }));
      icon.texture = region.iconTexture;
      icon.width = icon.height = iconSize;
      region.icons.addChild(icon);
    }

    let iconCount=0;
    for (const node of region.polygonTree) {
      //console.log(node);
      const icon = region.icons.children[iconCount++];
      //icon.texture = texture.src;
      icon.x = node.bounds.center.x - (iconSize / 2);
      icon.y = node.bounds.center.y - (iconSize / 2);
      console.log(`ICON '${texture.src}' at (${icon.x}, ${icon.y}) for REGION bounds`, node.bounds)
    }
  }
})
