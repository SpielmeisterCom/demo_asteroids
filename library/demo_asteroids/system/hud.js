/**
 * @class demo_asteroids.system.hud
 * @singleton
 */

define(
	'demo_asteroids/system/hud',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'
		
		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var hud = function( spell ) {
			
		}
		
		var renderLives = function( spell, player ) {
			var liveEntityIds = spell.world.hud,
				length        = liveEntityIds.length,
				entityManager = spell.entityManager
			
			for( var i = 0; i < length; i++ ) {
				var liveEntityId = liveEntityIds[ i ],
					opacity      = player.lives > i ? 1 : 0
				
				entityManager.updateComponentAttribute( 
					liveEntityId, 
					'spell.component.visualObject', 
					'opacity', 
					opacity 
				)
			}
			
		}
		
		hud.prototype = {
			/**
		 	 * Gets called when the system is created.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {
			
			},
		
			/**
		 	 * Gets called when the system is destroyed.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			destroy: function( spell ) {
				
			},
		
			/**
		 	 * Gets called when the system is activated.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			activate: function( spell ) {
				if( spell.world.hud  ) return
				
				var liveEntityIds = []
				
				var entityManager = spell.entityManager
				
				var x = 0
				var hudEntityId = entityManager.getEntityIdsByName( 'HUD' )[0]
				
				for( var i = 0; i < 3; i++ ) {
					var entityId = entityManager.createEntity(
						{
							entityTemplateId: 'demo_asteroids.entity.live',
							parentId: hudEntityId,
							config: {
								"spell.component.2d.transform": {
						             "translation": [ x, 0 ]
						          }
							}
						}						
					)
					
					liveEntityIds.push( entityId )
					
					x += 10
				}
				
				spell.world.hud = liveEntityIds			
			},
		
			/**
		 	 * Gets called when the system is deactivated.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			deactivate: function( spell ) {
				
			},
		
			/**
		 	 * Gets called to trigger the processing of game state.
		 	 *
			 * @param {Object} [spell] The spell object.
			 * @param {Object} [timeInMs] The current time in ms.
			 * @param {Object} [deltaTimeInMs] The elapsed time in ms.
			 */
			process: function( spell, timeInMs, deltaTimeInMs ) {
				var players = this.players
				
				for( var id in players ) {
					renderLives( spell, players[ id ] )
				}
			}
		}
		
		return hud
	}
)
