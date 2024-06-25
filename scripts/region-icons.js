//
// Allow an ICON (img) to be specified for each region.
//
// Draw the region in the centre of each of the region's polygons.
//

const MODULE_NAME = "easy-regions";
const IMG_FIELD = "flags.easy-regions.img";

let icon_field;

function iconField() {
  if (icon_field) return icon_field;

  const fields = foundry.data.fields;
  // Create a fake DataField for the image (generic)

  icon_field = new fields.SchemaField({
    src: new fields.FilePathField({
      categories: ["IMAGE"],
      label: `${MODULE_NAME}.regionConfig.src.label`,
      hint: `${MODULE_NAME}.regionConfig.src.hint`
    }),
    tint: new fields.ColorField({
      nullable: false,
      initial: "#ffffff",
      label: `${MODULE_NAME}.regionConfig.tint.label`,
      hint: `${MODULE_NAME}.regionConfig.tint.hint`
    }),
    size: new fields.NumberField({
      // Same settings as per BaseNote
      required: true,
      nullable: false,
      integer: true,
      min: 32,
      initial: 40,
      label: `${MODULE_NAME}.regionConfig.size.label`,
      hint: `${MODULE_NAME}.regionConfig.size.hint`,
      validationError: `${MODULE_NAME}.regionConfig.size.validation`,
      label: "NOTE.IconSize"
    }),
  }, {
    // Options
  }, {
    // Context
    name: `flags.${MODULE_NAME}`
  })
  return icon_field;
}


Hooks.on("renderRegionConfig", (doc, html) => {
  // Create the FormGroup to add to the form (specific)
  const flags = doc.document.flags[MODULE_NAME];
  const fields = iconField().fields;
  const group = document.createElement("fieldset");
  group.append(fields.src.toFormGroup({ localize: true }, {
    placeholder: `${MODULE_NAME}.regionConfig.icon.placeholder`,
    value: flags?.src,
    localize: true,
  }));
  group.append(fields.tint.toFormGroup({ localize: true }, {
    value: flags?.tint,
    localize: true,
  }));
  group.append(fields.size.toFormGroup({ localize: true }, {
    value: flags?.size,
    localize: true,
  }));

  let section = html.querySelector('section.region-shapes');
  section.append(group);
})


Hooks.on("refreshRegion", async (region, options) => {
  if (!options.refreshState) return;

  const texture = region.document.flags[MODULE_NAME]?.src;

  // Initial creation of required icons.
  // All other changes made during _onUpdate.
  if (region.icons || !texture) return;

  console.log(`${MODULE_NAME} - refreshRegion: creating initial Icons:`, { region, options })
  const iconTint = region.document.flags[MODULE_NAME]?.tint ?? 0xFFFFFF;
  const iconSize = region.document.flags[MODULE_NAME]?.size ?? 32;

  region.icons = region.addChild(new PIXI.Graphics());
  region.icons.eventMode = "none";

  region.iconTextureSrc = texture;
  region.iconTexture = await loadTexture(texture);

  for (const node of region.polygonTree) {
    const icon = new PIXI.Sprite();
    icon.texture = region.iconTexture;
    icon.tint = iconTint;
    icon.width = icon.height = iconSize;
    icon.x = node.bounds.center.x - (iconSize / 2);
    icon.y = node.bounds.center.y - (iconSize / 2);
    region.icons.addChild(icon);
  }
})


Hooks.on("updateRegion", async (document, changed, options, userId) => {
  console.log(`${MODULE_NAME} - updateRegion`, { document, changed, options, userId} )
  const region = document.object;

  const regionFlags = document.flags[MODULE_NAME];
  if (!regionFlags || !region.icons) return;

  const changedFlags = changed.flags?.[MODULE_NAME];
  const update_texture = (changedFlags && "src" in changedFlags);
  const update_tint = (changedFlags && "tint" in changedFlags);
  const update_size = (changedFlags && "size" in changedFlags);
  const update_border = ("shapes" in changed);

  console.log(`${MODULE_NAME} - updateRegion`, { update_texture, update_tint, update_size, update_border })

  if (update_texture) {
    if (region.textureSrc) {
      console.log(`${MODULE_NAME} - updateRegion: deleting old texture`)
      region.iconTextureSrc = null;
      region.iconTexture.destroy();
      region.iconTexture = null;
    }
    if (changedFlags.src) {
      console.log(`${MODULE_NAME} - updateRegion: creating new texture`)
      region.iconTextureSrc = changedFlags.src;
      region.iconTexture = await loadTexture(changedFlags.src);
      for (const node of region.icons)
        node.texture = region.iconTexture;
    }
  }
  const iconTint = changedFlags?.tint ?? regionFlags.tint ?? 0xFFFFFF;
  const iconSize = changedFlags?.size ?? regionFlags.size ?? 32;
  if (update_border) {
    const oldCount = region.icons.children.length;
    const newCount = region.polygonTree.children.length;
    console.log(`${MODULE_NAME} - updateRegion: changing border length from ${oldCount} to ${newCount}`)
    for (let i = oldCount; i > newCount; i--)
      region.icons.children[i - 1].destroy({ children: true })
    for (let i = oldCount; i < newCount; i++) {
      const icon = new PIXI.Sprite();
      icon.tint = iconTint;
      icon.texture = region.iconTexture;
      icon.width = icon.height = iconSize;
      region.icons.addChild(icon);
    }
  }
  if (update_tint || update_size || update_border) {
    console.log(`${MODULE_NAME} - updateRegion: updating each icon`)
    let iconCount = 0;
    for (const node of region.polygonTree) {
      const icon = region.icons.children[iconCount++];
      if (update_tint) icon.tint = iconTint;
      if (update_size || update_border) {
        if (update_size)
          icon.width = icon.height = iconSize;
        icon.x = node.bounds.center.x - (iconSize / 2);
        icon.y = node.bounds.center.y - (iconSize / 2);
      }
    }
  }
})