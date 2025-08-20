// Original code from foundry: 
// client-esm\data\region-behaviors\teleport-token.mjs
//
// This code is modified under Foundry's Limited License for Package Development

/**
 * The data model for a behavior that teleports Token that enter the Region to a preset destination Region.
 *
 * @property {RegionDocument} destination    The destination Region the Token is teleported to.
 * @property {boolean} choice                Show teleportation confirmation dialog?
 */

// MODULE: add full route to base class
export default class EasyTeleportTokenRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {

  /** @override */
  static LOCALIZATION_PREFIXES = ["BEHAVIOR.TYPES.teleportToken", "BEHAVIOR.TYPES.base"];

  /* ---------------------------------------- */

  /** @override */
  static defineSchema() {
    // MODULE: add source location for fields
    const fields = foundry.data.fields;
    return {
      destination: new fields.DocumentUUIDField({type: "Region"}),
      choice: new fields.BooleanField(),
      // MODULE: add two new fields
      // StringField defaults: { blank: true, trim: true, nullable: false, initial: undefined, choices: undefined, textSearch: false }
      confirmPrompt: new fields.StringField({placeholder: "BEHAVIOR.TYPES.teleportToken.Confirm"}),
      confirmPromptGM: new fields.StringField({placeholder: "BEHAVIOR.TYPES.teleportToken.ConfirmGM"})
    };
  }

  /* ---------------------------------------- */

  /**
   * Teleport the Token if it moves into the Region.
   * @param {RegionMoveInEvent} event
   * @this {EasyTeleportTokenRegionBehaviorType}
   */
  static async #onTokenMoveIn(event) {
    if ( !this.destination || (event.data.movement.passed.waypoints.at(-1).action === "displace") ) return;
    const destination = fromUuidSync(this.destination);
    if ( !(destination instanceof RegionDocument) ) {
      console.error(`${this.destination} does not exist`);
      return;
    }
    const token = event.data.token;
    const user = event.user;
    if ( user.isSelf ) token.stopMovement();
    if ( !this.#shouldTeleport(token, destination, user) ) return;

    // When the browser tab is/becomes hidden, don't wait for the movement animation and
    // proceed immediately. Otherwise wait for the movement animation to complete.
    if ( token.rendered && token.object.movementAnimationPromise && !window.document.hidden ) {
      let visibilitychange;
      await Promise.race([token.object.movementAnimationPromise, new Promise(resolve => {
        visibilitychange = event => {
          if ( window.document.hidden ) resolve();
        };
        window.document.addEventListener("visibilitychange", visibilitychange);
      }).finally(() => {
        window.document.removeEventListener("visibilitychange", visibilitychange);
      })]);
    }

    if ( this.choice ) {
      let confirmed;
      // MODULE - pass behavior
      if ( user.isSelf ) confirmed = await EasyTeleportTokenRegionBehaviorType.#confirmDialog(token, destination, /*behavior*/this.parent);
      else confirmed = await user.query("confirmTeleportToken", {behaviorUuid: this.parent.uuid, tokenUuid: token.uuid});
      if ( !confirmed ) return;
    }
    await destination.teleportToken(token);

    // View destination scene / Pull the user to the destination scene only if the user is currently viewing the origin
    // scene
    if ( token.parent !== destination.parent ) {
      if ( user.isSelf ) {
        if ( token.parent.isView ) await destination.parent.view();
      } else {
        if ( token.parent.id === user.viewedScene ) await game.socket.emit("pullToScene", destination.parent.id, user.id);
      }
    }
  }

  /* ---------------------------------------- */

  /** @override */
  static events = {
    // MODULE - add "CONST." prefix
    [CONST.REGION_EVENTS.TOKEN_MOVE_IN]: this.#onTokenMoveIn
  };

  /* ---------------------------------------- */

  /**
   * Should the current user teleport the token?
   * @param {TokenDocument} token           The token that is teleported.
   * @param {RegionDocument} destination    The destination region.
   * @param {User} user                     The user that moved the token.
   * @returns {boolean}                     Should the current user teleport the token?
   */
  #shouldTeleport(token, destination, user) {
    const userCanTeleport = (token.parent === destination.parent) || (user.can("TOKEN_CREATE") && user.can("TOKEN_DELETE"));
    if ( userCanTeleport ) return user.isSelf;
    return game.user.isDesignated(u => u.active && u.can("TOKEN_CREATE") && u.can("TOKEN_DELETE") && (!this.choice || u.can("QUERY_USER")));
  }

  /* -------------------------------------------- */

  /**
   * The query handler for teleporation confirmation.
   * @type {(queryData: {behaviorUuid: string; token: tokenUuid}) => Promise<boolean>}
   * @internal
   */
  static _confirmQuery = async ({behaviorUuid, tokenUuid}) => {
    const behavior = await fromUuid(behaviorUuid);
    if ( !behavior || (behavior.type !== "teleportToken") || !behavior.system.destination ) return false;
    const destination = await fromUuid(behavior.system.destination);
    if ( !destination ) return false;
    const token = await fromUuid(tokenUuid);
    if ( !token ) return false;
    return EasyTeleportTokenRegionBehaviorType.#confirmDialog(token, destination, behavior);
  };

  /* -------------------------------------------- */

  /**
   * Display a dialog to confirm the teleportation?
   * @param {TokenDocument} token           The token that is teleported.
   * @param {RegionDocument} destination    The destination region.
   * @param {Behaviour} behavior            MODULE ADDITION
   * @returns {Promise<boolean>}            The result of the dialog.
   */
  static async #confirmDialog(token, destination, behavior) {
    // MODULE - change template for message
    const question = game.i18n.format(game.user.isGM ? 
      (behavior.system.confirmPromptGM || "BEHAVIOR.TYPES.teleportToken.ConfirmGM")
      : (behavior.system.confirmPrompt || "BEHAVIOR.TYPES.teleportToken.Confirm"), {
      token: foundry.utils.escapeHTML(token.name),
      region: foundry.utils.escapeHTML(destination.name),
      scene: foundry.utils.escapeHTML(destination.parent.name)
    });
    // MODULE: full path to DialogV2
    return foundry.applications.api.DialogV2.confirm({
      window: {title: CONFIG.RegionBehavior.typeLabels.teleportToken},
      content: `<p>${question}</p>`
    });
  }
}