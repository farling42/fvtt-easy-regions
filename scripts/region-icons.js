//
// Allow an ICON (img) to be specified for each region.
//
// Draw the region in the centre of each of the region's polygons.
//

import { MOD } from './easy-regions.js';

let icon_field;

function iconField() {
  if (icon_field) return icon_field;

  const fields = foundry.data.fields;
  const PREFIX = `${MOD.id}.regionConfig`;
  // Create a fake DataField for the image (generic)

  icon_field = new fields.SchemaField({
    src: new fields.FilePathField({
      categories: ["IMAGE"],
      label: `${PREFIX}.src.label`,
      hint: `${PREFIX}.src.hint`
    }),
    tint: new fields.ColorField({
      nullable: false,
      initial: "#ffffff",
      label: `${PREFIX}.tint.label`,
      hint: `${PREFIX}.tint.hint`
    }),
    size: new fields.NumberField({
      // Same settings as per BaseNote
      required: true,
      nullable: false,
      integer: true,
      min: 32,
      initial: 40,
      label: `${PREFIX}.size.label`,
      hint: `${PREFIX}.size.hint`,
      validationError: `${PREFIX}.size.validation`
    }),
  }, {
    // Options
  }, {
    // Context
    name: `flags.${MOD.id}`
  })
  return icon_field;
}

function icon_renderRegionConfig(doc, html) {
  // Create the FormGroup to add to the form (specific)
  const flags = doc.document.flags[MOD.id];
  const fields = iconField().fields;
  const group = document.createElement("fieldset");
  group.append(fields.src.toFormGroup({ localize: true }, {
    value: flags?.src,
    localize: true,
  }));
  const tint_group = fields.tint.toFormGroup({ localize: true }, {
    //value: flags?.tint,  // This won't set the correct value from renderRegionConfig hook 
    localize: true,
  });
  if (flags?.tint) tint_group.querySelector('color-picker')?._setValue(flags?.tint)
  group.append(tint_group);

  group.append(fields.size.toFormGroup({ localize: true }, {
    value: flags?.size,
    localize: true,
  }));

  let section = html.querySelector('section.region-shapes');
  section.append(group);
}


async function icon_refreshRegion (region, options) {

  if (!options.refreshState) return;

  const flags = region.document.flags[MOD.id];
  const texture = flags?.src;

  // Initial creation of required icons.
  // All other changes made during _onUpdate.
  if (region.icons || !texture) return;

  if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | refreshRegion: creating initial Icons:`, { region, options })
  const iconTint = flags?.tint ?? 0xFFFFFF;
  const iconSize = flags?.size ?? 32;

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
}


async function icon_updateRegion(document, changed, options, userId) {

  if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | updateRegion: `, { document, changed, options, userId} )
  const region = document.object;

  const regionFlags = document.flags[MOD.id];
  if (!regionFlags || !region.icons) return;

  const changedFlags = changed.flags?.[MOD.id];
  const update_texture = (changedFlags && "src" in changedFlags);
  const update_tint = (changedFlags && "tint" in changedFlags);
  const update_size = (changedFlags && "size" in changedFlags);
  const update_border = ("shapes" in changed);

  if (update_texture) {
    if (region.textureSrc) {
      if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | updateRegion: deleting old texture`)
      region.iconTextureSrc = null;
      region.iconTexture.destroy();
      region.iconTexture = null;
    }
    if (changedFlags.src) {
      if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | updateRegion: creating new texture`)
      region.iconTextureSrc = changedFlags.src;
      region.iconTexture = await loadTexture(changedFlags.src);
      for (const node of region.icons.children)
        node.texture = region.iconTexture;
    }
  }
  const iconTint = changedFlags?.tint ?? regionFlags.tint ?? 0xFFFFFF;
  const iconSize = changedFlags?.size ?? regionFlags.size ?? 32;
  if (update_border) {
    const oldCount = region.icons.children.length;
    const newCount = region.polygonTree.children.length;
    if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | updateRegion: changing border length from ${oldCount} to ${newCount}`)
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
    if (CONFIG.debug[MOD.id]) console.debug(`${MOD.title} | updateRegion: updating each icon`)
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
}


export function initRegionIcons() {
  console.log(`${MOD.title} | Region Icons Initialising`);

  Hooks.on("renderRegionConfig", icon_renderRegionConfig);
  Hooks.on("refreshRegion", icon_refreshRegion);
  Hooks.on("updateRegion", icon_updateRegion);

  console.log(`${MOD.title} | Region Icons Initialised`);
}