# CHANGELOG

## 0.7.0

- Change of arrow symbol to rightwards double-arrow instead of wide-headed rightwards arrow.
- Add module configuration option to disable UUID dropdown list (but why would you want this)?
- Add option to perform Region Behavior matching based simply on identical Region names.
- Slight rework of startup, so settings are guaranteed to be registered before each individual component is initialised.
- Rename source files, and modify logging, to make it easier to see files in browser console.

## 0.6.1

- Fix a logic error when checking the "only navigation scenes" for automatic linking of teleport regions.

## 0.6.0

- Allow automatic linking of Teleport Behaviors, based on the complementary matching names between the regions to be linked.

## 0.5.0

- Add an option (default enabled) to highlight regions which have no behaviors configured, by changing the colour of the config button for that region.

## 0.4.1

- Remove explicit placeholder text for the icon's file path field.
- Set banner tags in README.md

## 0.4.0

- Make startup more reliable, so that region-icons doesn't generate an error.
- Provide documentation about enabling debugging.

## 0.3.1

- Fixes an error that occurred when changing the image of an Icon. (The change occurred, it just wasn't redrawn.)

## 0.3.0

- Add new configuration parameters to the Region Config window to set an Icon (with size and tint) which will appear at the centre of each polygon for that region.
- Put debugging behind `CONFIG.debug["easy-regions"]`

## 0.2.0

- Add a module option to only display UUIDs for Scenes which have navigation enabled (appear in the list of scenes across the top of the canvas).

## 0.1.2

- Fix issue with languages folder.

## 0.1.1

- Fix syntax error in module.json

## 0.1.0

- First release