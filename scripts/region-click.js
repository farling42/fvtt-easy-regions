// Allow Clicking on a Region to trigger a RegionBehavior

// init needs to be called before Regions are added to the scene,
// otherwise the event handlers aren't registered with the MouseInteractionManager.

import { MOD, SETTING_CLICK_LEFT1, SETTING_CLICK_LEFT2, SETTING_CLICK_RIGHT1, SETTING_CLICK_RIGHT2 } from './easy-regions.js';

let click_left1_event;
let click_left2_event;
let click_right1_event;
let click_right2_event;

function emulateEvent(region, event_name) {

  console.debug(`${MOD.id} | emulating event for "${event_name}" on region "${region.document.name}"`);

  function sendEvent(data) {
    // or this._triggerEvent(name, data)
    console.log(`${MOD.id} | sending event "${event_name}" to region document "${region.document.name}"`);
    return region.document._handleEvent({
      name: event_name,
      data: data,
      region: region,
      user: game.user
    })
  }

  switch (event_name) {
    case CONST.REGION_EVENTS.BEHAVIOR_STATUS:
      return sendEvent({ data: status });

    case CONST.REGION_EVENTS.REGION_BOUNDARY:
      return sendEvent({})

    case CONST.REGION_EVENTS.TOKEN_ENTER:
    case CONST.REGION_EVENTS.TOKEN_EXIT:
    case CONST.REGION_EVENTS.TOKEN_MOVE:
    case CONST.REGION_EVENTS.TOKEN_MOVE_IN:
    case CONST.REGION_EVENTS.TOKEN_MOVE_OUT:
    case CONST.REGION_EVENTS.TOKEN_PRE_MOVE:
      {
        const token = canvas.ready && (canvas.tokens.controlled.length === 1) ? canvas.tokens.controlled[0] : null;
        if (!token) break;
        return sendEvent({ token });
      }

    case CONST.REGION_EVENTS.TOKEN_ROUND_END:
    case CONST.REGION_EVENTS.TOKEN_ROUND_START:
      {
        const token = canvas.ready && (canvas.tokens.controlled.length === 1) ? canvas.tokens.controlled[0] : null;
        if (!token) break;
        const combatants = Combat.getCombatantsByToken(token);
        if (!combatants) break;
        // once for each combatant
        return sendEvent({ token, combatant });
      }

    case CONST.REGION_EVENTS.TOKEN_TURN_END:
    case CONST.REGION_EVENTS.TOKEN_TURN_START:
      {
        const token = canvas.ready && (canvas.tokens.controlled.length === 1) ? canvas.tokens.controlled[0] : null;
        if (!token) break;
        const combatants = Combat.getCombatantsByToken(token);
        if (!combatants) break;
        return sendEvent({ token, combatant });
      }
  }
  console.debug(`${MOD.id} | No handling for event '${event_name}'`);
}

function my_region_clickLeft1(wrapper, event) {
  let result = wrapper(event);
  emulateEvent(this, click_left1_event);
  return result;
}

function my_region_clickLeft2(wrapper, event) {
  // foundry.js:27201
  let result = wrapper(event);
  console.log(`my_region_clickLeft2:`, event);
  emulateEvent(this, click_left2_event);
  return result;
}

function my_region_clickRight1(wrapper, event) {
  // foundry.js:27201
  let result = wrapper(event);
  console.log(`my_region_clickRight1:`, event);
  emulateEvent(this, click_right1_event);
  return result;
}

function my_region_clickRight2(wrapper, event) {
  // foundry.js:27201
  let result = wrapper(event);
  console.log(`my_region_clickRight2:`, event);
  emulateEvent(this, click_right2_event);
  return result;
}

function my_region_canHover(wrapper, user, event) {
  let result = wrapper(user, event);
  // Only allow hover if a behavior uses one of our events
  console.debug(`${MOD.id} | canHover`)
  return true;
}

function my_region_refreshState(wrapper) {
  wrapper();
  const oldMode = this.eventMode;
  if (!this.layer.active) {
    this.eventMode = "static";
    MouseInteractionManager.emulateMoveEvent();  
    console.log(`my_region_refreshState: layer.eventMode = ${this.layer.eventMode}`);
  }
}

function my_regionLayer_deactivate(wrapper) {
  wrapper();
  console.log(`my_regionLayer_deactivate:`);
  this.objects.visible = this.interactiveChildren = true;
  //this.eventMode = "static";
}

export function initClickEvents() {

  console.log(`${MOD.title} | Region Clicking installing`);

  //click_left_event = CONST.REGION_EVENTS.TOKEN_ENTER;
  //click_left2_event = CONST.REGION_EVENTS.TOKEN_EXIT;
  //click_right_event = CONST.REGION_EVENTS.TOKEN_TURN_START;
  //click_right2_event = CONST.REGION_EVENTS.TOKEN_TURN_END;

  click_left1_event = game.settings.get(MOD.id, SETTING_CLICK_LEFT1);
  click_left2_event = game.settings.get(MOD.id, SETTING_CLICK_LEFT2);
  click_right1_event = game.settings.get(MOD.id, SETTING_CLICK_RIGHT1);
  click_right2_event = game.settings.get(MOD.id, SETTING_CLICK_RIGHT2);
  let anyset = false;

  if (click_left1_event !== "none") {
    libWrapper.register(MOD.id,
      'CONFIG.Region.objectClass.prototype._onClickLeft',   // prototype = Region
      my_region_clickLeft1,
      libWrapper.WRAPPER);
      anyset=true;
    console.debug(`${MOD.id} | Registed left click handler`)
  }

  if (click_left2_event !== "none") {
    libWrapper.register(MOD.id,
      'CONFIG.Region.objectClass.prototype._onClickLeft2',
      my_region_clickLeft2,
      libWrapper.WRAPPER);
      anyset=true;
    console.debug(`${MOD.id} | Registed left double click handler`)
  }

  if (click_right1_event !== "none") {
    libWrapper.register(MOD.id,
      'CONFIG.Region.objectClass.prototype._onClickRight',
      my_region_clickRight1,
      libWrapper.WRAPPER);
      anyset=true;
    console.debug(`${MOD.id} | Registed right click handler`)
  }

  if (click_right2_event !== "none") {
    libWrapper.register(MOD.id,
      'CONFIG.Region.objectClass.prototype._onClickRight2',
      my_region_clickRight2,
      libWrapper.WRAPPER);
      anyset=true;
    console.debug(`${MOD.id} | Registed right double click handler`)
  }

  if (anyset) {
    libWrapper.register(MOD.id,
      'CONFIG.Region.objectClass.prototype._canHover',
      my_region_canHover,
      libWrapper.WRAPPER);
    console.debug(`${MOD.id} | Registed canHover handler`)    

    libWrapper.register(MOD.id,
      'CONFIG.Region.layerClass.prototype._deactivate',
      my_regionLayer_deactivate,
      libWrapper.WRAPPER);
    CONFIG.Region.layerClass.interactiveChildren = true;
    if (CONFIG.Region.layerClass.objects) CONFIG.Region.layerClass.objects.visible = true;
    console.debug(`${MOD.id} | Registed RegionLayer._deactivate handler`)    

    libWrapper.register(MOD.id,
      'CONFIG.Region.objectClass.prototype._refreshState',
      my_region_refreshState,
      libWrapper.WRAPPER);
    console.debug(`${MOD.id} | Registed Region._refreshState handler`)    

  }

  console.log(`${MOD.title} | Region Clicking Initialised`);
}