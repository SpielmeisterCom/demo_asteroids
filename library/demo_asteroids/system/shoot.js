/**
 * @class demo_asteroids.system.shoot
 * @singleton
 */

define(
	'demo_asteroids/system/shoot',
	[
		'spell/shared/util/platform/PlatformKit',
		'spell/math/vec2',
		
		'spell/functions'
	],
	function(
		Platform,
		vec2,
		
		_
	) {
		'use strict'
		
		
		
		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var shoot = function( spell ) {
			this.entityManager = spell.entityManager		
		}
		
		var startShooting = function( physics, entityManager, id, transform, weapon ) {
			var worldMatrix = transform.worldMatrix,
				rotation    = [ 
				worldMatrix[ 0 ] * 0 + worldMatrix[ 3 ] * 1,
				worldMatrix[ 1 ] * 0 + worldMatrix[ 4 ] * 1
			]
		
			var entity = entityManager.createEntity({
    			entityTemplateId: 'demo_asteroids.entity.missile',
    			config: {
					"spell.component.2d.transform": {
            			"translation": transform.worldTranslation
        			}
    			}
			})
			
			Platform.registerTimer(
				_.bind( entityManager.removeEntity, entityManager, entity ),
				2000
			)			

			physics.applyImpulse( entity, vec2.scale( [], rotation, weapon.tempo ) )
		}
		
		shoot.prototype = {
			/**
		 	 * Gets called when the system is created.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {
				this.physics = spell.world.physics
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
				var weapons         = this.weapons,
					transformations = this.transformations,
					weapon, transform
			
				for( var id in weapons ) {
					weapon    = weapons[ id ]
					transform = transformations[ id ]
					
					if( weapon.shooting === true && weapon.lastShot + weapon.rate < timeInMs ) {
						startShooting( this.physics, this.entityManager, id, transform, weapon )
						weapon.lastShot = timeInMs
					}
				}
			}
		}
		
		return shoot
	}
)
