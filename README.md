[![ko-fi](https://img.shields.io/badge/Ko--Fi-farling-success)](https://ko-fi.com/farling)
[![patreon](https://img.shields.io/badge/Patreon-amusingtime-success)](https://patreon.com/amusingtime)
[![paypal](https://img.shields.io/badge/Paypal-farling-success)](https://paypal.me/farling)
![GitHub License](https://img.shields.io/github/license/farling42/fvtt-easy-regions)
![Foundry Info](https://img.shields.io/badge/Foundry-v12-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/farling42/fvtt-easy-regions/latest/module.zip)
![Forge installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Feasy-regions)

# Easy Regions

Easy Regions makes it easier to find the correct UUID when managing regions.

It also works for other UUID fields which require a field of a supported type (Macro, Region, RegionBehavior).

## Automatic Linking of Teleport Regions, based on Region name

By setting up the pattern of your region names in the module settings, on creating a Teleport Behavior in a region then the behavior's UUID field will be automatically populated to the region that has a matching name - and that other region will have its Teleport Behavior set to point to this region.

There are two methods available - identical Region names, or pattern matching between the names of two Regions.

For example, in a region called "A25 down to B05", creating a Teleport Behavior will automatically linked that behavior to a region with a name of "B05 up to A25". A Teleport Behavior will be created on the other region if it doesn't already exist.

A simple workflow:

- On first scene, create a region called "A01 down to B02"
- On second scene, create a region called "B02 up to A01" (save this new region now)
- Open the second region again and create a Teleport Behavior in that region
- _the teleport will be automatically linked to the region on the first scene_

Here's a quick video showing two regions being linked:
[![REGION TELEPORT EXAMPLE](http://img.youtube.com/vi/2bDblk4W034/0.jpg)](http://www.youtube.com/watch?v=2bDblk4W034 "Quick teleport creation on Foundry using the Easy Regions module")

## UUID references

- Adds a drop-down menu to all UUIDFields (e.g. for selecting a Macro, Region, or Region Behavior).

You can enter some of the text of the label (not the UUID) in order for the drop-down list to automatically shrink to just the entries containing the entered text.

![image](https://raw.githubusercontent.com/farling42/fvtt-easy-regions/master/images/regions-default-datalist.webp)

There is a module option to restrict the list of UUIDs for Scenes, Regions and Region Behaviors to only those in Scenes which have Navigation enabled (and therefore appear in the list across the top of the canvas). _This should help alleviate the list being too long in worlds with many scenes._

There is a module option to use custom handling for the datalist since Chromium-based browsers insist on displaying both the value and the label. This option (default enabled) will display only the labels.

![image](https://raw.githubusercontent.com/farling42/fvtt-easy-regions/master/images/regions-custom-datalist.webp)

**NOTE**: The electron browser which is used in the Foundry app does not provide a scrollbar in the dropdown datalist, so you will only see a list up to the height of your app window. In this case you can start typing the name of the scene or region to reduce the list down to all the relevant entries.

## Region Icons

- Define an Icon and specify its colour and size, to be displayed in the centre of each polygon of a region.

![image](https://raw.githubusercontent.com/farling42/fvtt-easy-regions/master/images/region-icons.webp)

There is a module option to disable icons if they are not required.

## Highlight Regions with no Behaviors in Region List

- Changes the colour of the Config button in the Region list if the region has no behaviors configured on it.

![image](https://raw.githubusercontent.com/farling42/fvtt-easy-regions/master/images/easy-region-no-behaviors.webp)

There is a module option to disable this highlighting if it is not required.

## Cost display on Drag Ruler

- The PF2E system has regions which indicate Difficult Terrain. This option updates the label of the drag ruler to also show
the cost if it is different from the distance.

![image](https://raw.githubusercontent.com/farling42/fvtt-easy-regions/master/images/region-distance.webp)

## Installation

The module can be found from Foundry's module settings page. Alternatively the latest version can be installed using the following link:

https://github.com/farling42/fvtt-easy-regions/releases/latest/download/module.json

## Macros

The following macro will add an icon to every Region whose name matches the given pattern

```js
const pattern = "down to";
const icon = "icons/svg/down.svg";

for (const scene of game.scenes) {
  for (const region of scene.regions) {
    if (region.name.includes(pattern)) {
      region.update({"flags.easy-regions.src": icon})
    }
  }
}
```

## Debugging

Additional output can be displayed in the Browser's console by enabling the Verbose view of messages, and entering the following command into the browser console:

`CONFIG.debug["easy-regions"]=true`
