define(
	'demo_asteroids/script/spacecraftBehavior',
	[
		'demo_asteroids/script/showFinish',
		'spell/shared/util/platform/PlatformKit',
		'spell/Defines',
		'spell/math/vec2',

		'spell/functions'
	],
	function(
		showFinish,
		Platform,
		Defines,
		vec2,

		_
	) {
		'use strict'


		var spacecraftComponentId = 'demo_asteroids.component.spacecraft'
		var PLAYER_COMPONENT_ID = 'demo_asteroids.component.player'
		
		var startAccelerate = function( spell, entityId ) {
			var entityManager = spell.entityManager,
				spacecraft    = entityManager.getComponentById( entityId, spacecraftComponentId ),
				transform     = entityManager.getComponentById( entityId, Defines.TRANSFORM_COMPONENT_ID )

			if( !spacecraft || !transform ) {
				return
			}

			var rotation      = transform.rotation,
				thrusterForce = spacecraft.thrusterForce
	
			vec2.set(
				spacecraft.force,
				Math.sin( -rotation ) * thrusterForce,
				Math.cos( rotation ) * thrusterForce
			)
		}

		var setTorque = function( rotationDirection, spell, entityId ) {
			var spacecraft = spell.entityManager.getComponentById( entityId, spacecraftComponentId )

			spacecraft.torque = rotationDirection ? spacecraft.thrusterForce * 0.1 * rotationDirection : 0

			if( spacecraft.force && ( spacecraft.force[0] || spacecraft.force[1] ) ) {
				startAccelerate( spell, entityId )
			}
		}
		
		var shoot = function( shooting, spell, entityId ) {
			var entityIds = spell.entityManager.getEntityIdsByName( 'weapon', entityId )
			
			var weapon = spell.entityManager.getComponentById( entityIds[0], 'demo_asteroids.component.weapon' )
			weapon.shooting = shooting
		}
		
		var onCollision = function( spell, entityId, collidedId, myCollisionGroupId, collisionGroupId ) {
			var entityManager = spell.entityManager
			
			if( collisionGroupId  === 1 ) {				
				var playerId = entityManager.getEntityIdsByName( 'player' )[0],
					player   = entityManager.getComponentById( playerId, PLAYER_COMPONENT_ID )
						
				player.lives--
				
				spell.audioContext.play( 
					spell.assetManager.get( 
						'sound:demo_asteroids.asset.sound.shipExplosion' 
					).resource,
					undefined,
					0.1
				)
					
				if( player.lives > 0 ) {					
					Platform.registerTimer(
						function() {
							spell.entityManager.createEntity({
				    			entityTemplateId: 'demo_asteroids.entity.spacecraft'
							})	
						},
						500
					)							
				} else {
					showFinish( spell, spell.entityManager )
				}
				
				spell.entityManager.removeEntity( entityId )
			}
		}

		var setTorqueZero = _.bind( setTorque, undefined, 0 )

		return {
			collision: onCollision,
			startSteerLeft : _.bind( setTorque, undefined, 1 ),
			stopSteerLeft : setTorqueZero,

			startSteerRight : _.bind( setTorque, undefined, -1 ),
			stopSteerRight : setTorqueZero,
			
			startShoot : _.bind( shoot, undefined, true ),
			stopShoot : _.bind( shoot, undefined, false ),
			

			startAccelerate : startAccelerate,
			stopAccelerate : function( spell, entityId ) {
				var spacecraft = spell.entityManager.getComponentById( entityId, 'demo_asteroids.component.spacecraft' )

				vec2.set( spacecraft.force, 0, 0 )
			}
		}
	}
)
