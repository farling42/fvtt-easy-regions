[![ko-fi](https://img.shields.io/badge/Ko--Fi-farling-success)](https://ko-fi.com/farling)
[![patreon](https://img.shields.io/badge/Patreon-amusingtime-success)](https://patreon.com/amusingtime)
[![paypal](https://img.shields.io/badge/Paypal-farling-success)](https://paypal.me/farling)
![GitHub License](https://img.shields.io/github/license/farling42/fvtt-easy-regions)
![Foundry Info](https://img.shields.io/badge/Foundry-v12-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/farling42/fvtt-easy-regions/latest/module.zip)

# Easy Regions

Easy Regions makes it easier to find the correct UUID when managing regions.

It also works for other UUID fields which require a field of a supported type (Macro, Region, RegionBehavior).

## UUID references

- Adds a drop-down menu to all UUIDFields (e.g. for selecting a Macro, Region, or Region Behavior).

You can enter some of the text of the label (not the UUID) in order for the drop-down list to automatically shrink to just the entries containing the entered text.

![image](https://raw.githubusercontent.com/farling42/fvtt-easy-regions/master/images/easy-region-example.png)

There is a module option to restrict the list of UUIDs for Scenes, Regions and Region Behaviors to only those in Scenes which have Navigation enabled (and therefore appear in the list across the top of the canvas). _This should help alleviate the list being too long in worlds with many scenes._

## Region Icons

- Define an Icon and specify its colour and size, to be displayed in the centre of each polygon of a region.

![image](https://raw.githubusercontent.com/farling42/fvtt-easy-regions/master/images/region-icons.webp)

There is a module option to disable icons if they are not required.

## Installation

The module can be found from Foundry's module settings page. Alternatively the latest version can be installed using the following link:

https://github.com/farling42/fvtt-easy-regions/releases/latest/download/module.json

## Debugging

Additional output can be displayed in the Browser's console by enabling the Verbose view of messages, and entering the following command into the browser console:

`CONFIG.debug["easy-regions"]=true`
