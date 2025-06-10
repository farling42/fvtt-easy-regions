// Original code from foundry: 
// client-esm\data\region-behaviors\teleport-token.mjs
//
// This code is modified under Foundry's Limited License for Package Development


// We only want to change the hard-coded use of:
//   BEHAVIOR.TYPES.teleportToken.Confirm
//   BEHAVIOR.TYPES.teleportTOken.ConfirmGM

export default class EasyTeleportTokenRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {

  /** @override */
  static LOCALIZATION_PREFIXES = ["BEHAVIOR.TYPES.teleportToken", "BEHAVIOR.TYPES.base"];

  /* ---------------------------------------- */

  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      destination: new fields.DocumentUUIDField({ type: "Region" }),
      choice: new fields.BooleanField(),
      // StringField defaults: { blank: true, trim: true, nullable: false, initial: undefined, choices: undefined, textSearch: false }
      confirmPrompt: new fields.StringField({placeholder: "BEHAVIOR.TYPES.teleportToken.Confirm"}),
      confirmPromptGM: new fields.StringField({placeholder: "BEHAVIOR.TYPES.teleportToken.ConfirmGM"})
    };
  }

  /* ---------------------------------------- */

  /**
   * Teleport the Token if it moves into the Region.
   * @param {RegionEvent} event
   * @this {EasyTeleportTokenRegionBehaviorType}
   */
  static async #onTokenMoveIn(event) {
    if (!this.destination || event.data.forced) return;
    const destination = fromUuidSync(this.destination);
    if (!(destination instanceof RegionDocument)) {
      console.error(`${this.destination} does not exist`);
      return;
    }
    const token = event.data.token;
    const user = event.user;
    if (!EasyTeleportTokenRegionBehaviorType.#shouldTeleport(token, destination, user)) return false;
    if (token.object) {
      const animation = CanvasAnimation.getAnimation(token.object.animationName);
      if (animation) await animation.promise;
    }
    if (this.choice) {
      let confirmed;
      if (user.isSelf) confirmed = await EasyTeleportTokenRegionBehaviorType.#confirmDialog(token, destination, this.parent);
      else {
        confirmed = await new Promise(resolve => {
          game.socket.emit("confirmTeleportToken", {
            behaviorUuid: this.parent.uuid,
            tokenUuid: token.uuid,
            userId: user.id
          }, resolve);
        });
      }
      if (!confirmed) return;
    }
    await EasyTeleportTokenRegionBehaviorType.#teleportToken(token, destination, user);
  }

  /* ---------------------------------------- */

  /**
   * Stop movement after a Token enters the Region.
   * @param {RegionEvent} event
   * @this {EasyTeleportTokenRegionBehaviorType}
   */
  static async #onTokenPreMove(event) {
    if (!this.destination) return;
    for (const segment of event.data.segments) {
      if (segment.type === Region.MOVEMENT_SEGMENT_TYPES.ENTER) {
        event.data.destination = segment.to;
        break;
      }
    }
  }

  /* ---------------------------------------- */

  /** @override */
  static events = {
    [CONST.REGION_EVENTS.TOKEN_MOVE_IN]: this.#onTokenMoveIn,
    [CONST.REGION_EVENTS.TOKEN_PRE_MOVE]: this.#onTokenPreMove
  };

  /* ---------------------------------------- */

  /**
   * Should the current user teleport the token?
   * @param {TokenDocument} token           The token that is teleported.
   * @param {RegionDocument} destination    The destination region.
   * @param {User} user                     The user that moved the token.
   * @returns {boolean}                     Should the current user teleport the token?
   */
  static #shouldTeleport(token, destination, user) {
    const userCanTeleport = (token.parent === destination.parent) || (user.can("TOKEN_CREATE") && user.can("TOKEN_DELETE"));
    if (userCanTeleport) return user.isSelf;
    const eligibleGMs = game.users.filter(u => u.active && u.isGM && u.can("TOKEN_CREATE") && u.can("TOKEN_DELETE"));
    if (eligibleGMs.length === 0) return false;
    eligibleGMs.sort((a, b) => (b.role - a.role) || a.id.compare(b.id));
    const designatedGM = eligibleGMs[0];
    return designatedGM.isSelf;
  }

  /* ---------------------------------------- */

  /**
   * Teleport the Token to the destination Region, which is in Scene that is not viewed.
   * @param {TokenDocument} originToken           The token that is teleported.
   * @param {RegionDocument} destinationRegion    The destination region.
   * @param {User} user                           The user that moved the token.
   */
  static async #teleportToken(originToken, destinationRegion, user) {
    const destinationScene = destinationRegion.parent;
    const destinationRegionObject = destinationRegion.object ?? new CONFIG.Region.objectClass(destinationRegion);
    const originScene = originToken.parent;
    let destinationToken;
    if (originScene === destinationScene) destinationToken = originToken;
    else {
      const originTokenData = originToken.toObject();
      delete originTokenData._id;
      destinationToken = TokenDocument.implementation.fromSource(originTokenData, { parent: destinationScene });
    }
    const destinationTokenObject = destinationToken.object ?? new CONFIG.Token.objectClass(destinationToken);

    // Reset destination token so that it isn't in an animated state
    if (destinationTokenObject.animationContexts.size !== 0) destinationToken.reset();

    // Get the destination position
    let destination;
    try {
      destination = EasyTeleportTokenRegionBehaviorType.#getDestination(destinationRegionObject, destinationTokenObject);
    } finally {
      if (!destinationRegion.object) destinationRegionObject.destroy({ children: true });
      if (!destinationToken.id || !destinationToken.object) destinationTokenObject.destroy({ children: true });
    }

    // If the origin and destination scene are the same
    if (originToken === destinationToken) {
      await originToken.update(destination, { teleport: true, forced: true });
      return;
    }

    // Otherwise teleport the token to the different scene
    destinationToken.updateSource(destination);

    // Create the new token
    const destinationTokenData = destinationToken.toObject();
    if (destinationScene.tokens.has(originToken.id)) delete destinationTokenData._id;
    else destinationTokenData._id = originToken.id;
    destinationToken = await TokenDocument.implementation.create(destinationToken,
      { parent: destinationScene, keepId: true });

    // Update all combatants of the token
    for (const combat of game.combats) {
      const toUpdate = [];
      for (const combatant of combat.combatants) {
        if ((combatant.sceneId === originScene.id) && (combatant.tokenId === originToken.id)) {
          toUpdate.push({ _id: combatant.id, sceneId: destinationScene.id, tokenId: destinationToken.id });
        }
      }
      if (toUpdate.length) await combat.updateEmbeddedDocuments("Combatant", toUpdate);
    }

    // Delete the old token
    await originToken.delete();

    // View destination scene / Pull the user to the destination scene only if the user is currently viewing the origin scene
    if (user.isSelf) {
      if (originScene.isView) await destinationScene.view();
    } else {
      if (originScene.id === user.viewedScene) await game.socket.emit("pullToScene", destinationScene.id, user.id);
    }
  }

  /* ---------------------------------------- */

  /**
   * Get a destination for the Token within the Region that places the token and its center point inside it.
   * @param {Region} region                                  The region that is the destination of the teleportation.
   * @param {Token} token                                    The token that is teleported.
   * @returns {{x: number, y: number, elevation: number}}    The destination.
   */
  static #getDestination(region, token) {
    const scene = region.document.parent;
    const grid = scene.grid;

    // Not all regions are valid teleportation destinations
    if (region.polygons.length === 0) throw new Error(`${region.document.uuid} is empty`);

    // Clamp the elevation of the token the elevation range of the destination region
    const elevation = Math.clamp(token.document.elevation, region.bottom, region.top);

    // Now we look for a random position within the destination region for the token
    let position;
    const pivot = token.getCenterPoint({ x: 0, y: 0 });

    // Find a random snapped position in square/hexagonal grids that place the token within the destination region
    if (!grid.isGridless) {

      // Identify token positions that place the token and its center point within the region
      const positions = [];
      const [i0, j0, i1, j1] = grid.getOffsetRange(new PIXI.Rectangle(
        0, 0, scene.dimensions.width, scene.dimensions.height).fit(region.bounds).pad(1));
      for (let i = i0; i < i1; i++) {
        for (let j = j0; j < j1; j++) {

          // Drop the token with its center point on the grid space center and snap the token position
          const center = grid.getCenterPoint({ i, j });

          // The grid space center must be inside the region to be a valid drop target
          if (!region.document.polygonTree.testPoint(center)) continue;

          const position = token.getSnappedPosition({ x: center.x - pivot.x, y: center.y - pivot.y });
          position.x = Math.round(position.x);
          position.y = Math.round(position.y);
          position.elevation = elevation;

          // The center point of the token must be inside the region
          if (!region.document.polygonTree.testPoint(token.getCenterPoint(position))) continue;

          // The token itself must be inside the region
          if (!token.testInsideRegion(region, position)) continue;

          positions.push(position);
        }
      }

      // Pick a random position
      if (positions.length !== 0) position = positions[Math.floor(positions.length * Math.random())];
    }

    // If we found a snapped position, we're done. Otherwise, search for an unsnapped position.
    if (position) return position;

    // Calculate the areas of each triangle of the triangulation
    const { vertices, indices } = region.triangulation;
    const areas = [];
    let totalArea = 0;
    for (let k = 0; k < indices.length; k += 3) {
      const i0 = indices[k] * 2;
      const i1 = indices[k + 1] * 2;
      const i2 = indices[k + 2] * 2;
      const x0 = vertices[i0];
      const y0 = vertices[i0 + 1];
      const x1 = vertices[i1];
      const y1 = vertices[i1 + 1];
      const x2 = vertices[i2];
      const y2 = vertices[i2 + 1];
      const area = Math.abs(((x1 - x0) * (y2 - y0)) - ((x2 - x0) * (y1 - y0))) / 2;
      totalArea += area;
      areas.push(area);
    }

    // Try to find a position that places the token inside the region
    for (let n = 0; n < 10; n++) {
      position = undefined;

      // Choose a triangle randomly weighted by area
      let j;
      let a = totalArea * Math.random();
      for (j = 0; j < areas.length - 1; j++) {
        a -= areas[j];
        if (a < 0) break;
      }
      const k = 3 * j;
      const i0 = indices[k] * 2;
      const i1 = indices[k + 1] * 2;
      const i2 = indices[k + 2] * 2;
      const x0 = vertices[i0];
      const y0 = vertices[i0 + 1];
      const x1 = vertices[i1];
      const y1 = vertices[i1 + 1];
      const x2 = vertices[i2];
      const y2 = vertices[i2 + 1];

      // Select a random point within the triangle
      const r1 = Math.sqrt(Math.random());
      const r2 = Math.random();
      const s = r1 * (1 - r2);
      const t = r1 * r2;
      const x = Math.round(x0 + ((x1 - x0) * s) + ((x2 - x0) * t) - pivot.x);
      const y = Math.round(y0 + ((y1 - y0) * s) + ((y2 - y0) * t) - pivot.y);
      position = { x, y, elevation };

      // The center point of the token must be inside the region
      if (!region.document.polygonTree.testPoint(token.getCenterPoint(position))) continue;

      // The token itself must be inside the region
      if (!token.testInsideRegion(region, position)) continue;
    }

    // If we still didn't find a position that places the token within the destination region,
    // the region is not a valid destination for teleporation or we didn't have luck finding one in 10 tries.
    if (!position) throw new Error(`${region.document.uuid} cannot accomodate ${token.document.uuid}`);

    return position;
  }

  /* -------------------------------------------- */

  /**
   * Activate the Socket event listeners.
   * @param {Socket} socket    The active game socket
   * @internal
   */
  static _activateSocketListeners(socket) {
    socket.on("confirmTeleportToken", this.#onSocketEvent.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle the socket event that handles teleporation confirmation.
   * @param {object} data                    The socket data.
   * @param {string} data.tokenUuid          The UUID of the Token that is teleported.
   * @param {string} data.destinationUuid    The UUID of the Region that is the destination of the teleportation.
   * @param {Function} ack                   The acknowledgement function to return the result of the confirmation to the server.
   */
  static async #onSocketEvent({ behaviorUuid, tokenUuid }, ack) {
    let confirmed = false;
    try {
      const behavior = await fromUuid(behaviorUuid);
      if (!behavior || (behavior.type !== "teleportToken") || !behavior.system.destination) return;
      const destination = await fromUuid(behavior.system.destination);
      if (!destination) return;
      const token = await fromUuid(tokenUuid);
      if (!token) return;
      confirmed = await EasyTeleportTokenRegionBehaviorType.#confirmDialog(token, destination, behavior);
    } finally {
      ack(confirmed);
    }
  }

  /* -------------------------------------------- */

  /**
   * Display a dialog to confirm the teleportation?
   * @param {TokenDocument} token           The token that is teleported.
   * @param {RegionDocument} destination    The destination region.
   * @returns {Promise<boolean>}            The result of the dialog.
   */
  static async #confirmDialog(token, destination, behavior) {
    return foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize(CONFIG.RegionBehavior.typeLabels.teleportToken) },
      content: `<p>${game.i18n.format(game.user.isGM ? (behavior.system.confirmPromptGM || "BEHAVIOR.TYPES.teleportToken.ConfirmGM")
        : (behavior.system.confirmPrompt || "BEHAVIOR.TYPES.teleportToken.Confirm"), {
        token: token.name,
        region: destination.name,
        scene: destination.parent.name,
        behavior: behavior.name
      })}</p>`,
      rejectClose: false
    });
  }
}  // class EasyTeleportTokenRegionBehaviorType
