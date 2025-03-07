# CHANGELOG

## 1.0.0

- Foundry V13 compatibility.
- Remove option to show distance in Drag label (it was PF2E-specific only, and not related to regions anyway).

## 0.9.3

- Mark as NOT compatible with Foundry V13.

## 0.9.2

- Don't display the distance cost if it is 0 (which occurs in combat for other players when a player moves their token).

## 0.9.1

- Clarify license use of code in easy-teleport-token.mjs
- Add `{behavior}` to allow the name of the Teleport Token region behavior object to be used in the confirm message string.
- Ensure New Confirm dialog works for Players.

## 0.9.0

- Provide an option to allow the prompt for Teleport Behavior to be specified individually for each region behavior.

## 0.8.0

- Provide the option to display Cost (if different) as well as distance on the drag ruler.

## 0.7.2

- Provide an option to provide custom handling for the datalist which is presented for UUID fields. It will hide the value that is displayed by Chromium browsers (Firefox doesn't need this custom handling.)

## 0.7.1

- Prevent error when updating Region icons on non-displayed scenes (e.g. via a global macro)

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