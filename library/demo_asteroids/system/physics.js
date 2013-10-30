/**
 * @class demo_asteroids.system.physics
 * @singleton
 */

define(
	'demo_asteroids/system/physics',
	[
		'spell/Defines',
		'spell/math/vec2',
		
		'spell/functions'
	],
	function(
		Defines,
		vec2,
		
		_
	) {
		'use strict'
		
		var PHYSICS_MS_DIVIDER = 100
		
		var setPosition = function( entityManager, id, position ) {
			entityManager.updateComponentAttribute( 
				id, 
				Defines.TRANSFORM_COMPONENT_ID, 
				'translation', 
				position 
			)
		}
		
		var detectCollision = function( physicsBodies, transformations, sourceId, targetId ) {
			var targetBody      = physicsBodies[ targetId ],
				sourceBody      = physicsBodies[ sourceId ],
				targetTransform = transformations[ targetId ],
				sourceTransform = transformations[ sourceId ]				
				
			if( !targetTransform || !sourceTransform || !targetBody || !sourceBody ) return
				
			var distance = vec2.distance( targetTransform.translation, sourceTransform.translation )
			
			return distance < targetBody.radius + sourceBody.radius
		}
		
		var performCollisionDetection = function( entityManager, physicsBodies, transformations ) {
			var keys	     = _.keys( physicsBodies ),
				i      		 = 0, 
				length 		 = keys.length,
				sourceBody, targetBody, j, sourceGroupId, targetGroupId,
				targetId, sourceId				
			
			for( i; i <= length; i++ ) {
				sourceId   = keys[i]
				sourceBody = physicsBodies[ sourceId ]
				
				for( j = i + 1; j <= length; j++ ) {
					targetId   = keys[j]
					targetBody = physicsBodies[ targetId ]
			
					if( detectCollision( physicsBodies, transformations, sourceId, targetId ) ) {
						sourceGroupId = sourceBody.collisionGroup
						targetGroupId = targetBody.collisionGroup
						
						entityManager.triggerEvent( sourceId, "collision", [ targetId, sourceGroupId, targetGroupId ])
						entityManager.triggerEvent( targetId, "collision", [ sourceId, targetGroupId, sourceGroupId ])
					}
				}
			}
			
		}
			
		var addAction = function( actions, type, id, value ) {
			var input = actions[ type ][ id ]
			
			if( type == 'force' ){
				input = _.isArray( input ) ? vec2.add( [], input, value ) : value
				
			} else if( type == 'torque' ) {
				input = input ? input + value : value
				
			} else if( type == 'impulse' ) {
				input = _.isArray( input ) ? vec2.add( [], input, value ) : value
			}
			
			actions[ type ][ id ] = input
		}
		
		var applyForce = function( actions, id, force ) {
			addAction( actions, 'force', id, force )
		}
	
		var applyTorque = function( actions, id, torque ) {
			addAction( actions, 'torque', id, torque )
		}
	
		var applyImpulse = function( actions, id, impulse ) {
			addAction( actions, 'impulse', id, impulse )
		}

		var calculateForce = function( actions, id, body ) {
			var force = actions[ 'force' ][ id ]
 
			if( force ) {
				vec2.add( body.velocity, body.velocity, force )
			}

			delete actions[ 'force' ][ id ]
		}	
	
		var applyForceOnEntity = function( deltaTimeInMs, actions, entityManager, id, transform, body ) {
			var velocity    = body.velocity,
				translation = transform.translation,
				maxVelocity = body.maxVelocity

			calculateForce( actions, id, body )

			if( velocity[ 0 ] === 0 && velocity[ 1 ] === 0 ) return
			
			if( maxVelocity ) {
				var negMaxVelocity = vec2.negate( vec2.create(), maxVelocity )
				
				if( velocity[ 0 ] > maxVelocity[ 0 ] ) {
					velocity[0] = maxVelocity[ 0 ]
					
				} else if( velocity[ 0 ] < negMaxVelocity[ 0 ]  ) {
					velocity[0] = negMaxVelocity[ 0 ]
				}
				
				if( velocity[ 1 ] > maxVelocity[ 1 ] ){
					velocity[1] = maxVelocity[ 1 ]	
					
				} else if( velocity[ 1 ] < negMaxVelocity[ 1 ]  ) {
					velocity[1] = negMaxVelocity[ 1 ]
				}
			}
			
			var traveledDistance = vec2.scale( [], velocity, deltaTimeInMs/PHYSICS_MS_DIVIDER )
	
			setPosition( 
				entityManager, 
				id, 
				vec2.add( [0,0], translation, traveledDistance ) 
			)
		}
			
		var calculateTorque = function( deltaTimeInMs, actions, id, transform ) {
			var torque = actions[ 'torque' ][ id ]

			if( torque ) {
				transform.rotation = transform.rotation + ( torque * deltaTimeInMs/PHYSICS_MS_DIVIDER )
			}
			
			delete actions[ 'torque' ][ id ]
		}
		
		var applyTorqueOnEntity = function( deltaTimeInMs, actions, entityManager, id, transform, body ) {
			
			calculateTorque( deltaTimeInMs, actions, id, transform )
			
			var rotation = transform.rotation
				
			entityManager.updateComponentAttribute( 
				id, 
				Defines.TRANSFORM_COMPONENT_ID, 
				'rotation', 
				rotation
			)			
		}

		var calculateImpulse = function( actions, id, body ) {
			var impulse = actions[ 'impulse' ][ id ]

			if( impulse ) {
				vec2.add( body.velocity, body.velocity, impulse )
			}	
			
			delete actions[ 'impulse' ][ id ]			
		}		
		
		var applyImpulseOnEntity = function( actions, entityManager, id, transform, body ) {
			
			calculateImpulse( actions, id, body )		
		}
		
		var applyPhysics = function( world, entityManager, deltaTimeInMs, bodies, transformations ) {
			var body, id, transform,
				actions = world.actions
			
			for( id in bodies ) {
				body      = bodies[ id ]
				transform = transformations[ id ]
				
				applyImpulseOnEntity( actions, entityManager, id, transform, body )
				
				applyForceOnEntity( deltaTimeInMs, actions, entityManager, id, transform, body )
				
				applyTorqueOnEntity( deltaTimeInMs, actions, entityManager, id, transform, body )
			}			
		}			

		
		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var physics = function( spell ) {
			var actions = spell.world ? spell.world.actions : {
				force: {},
				torque: {},
				impulse:{}
			}

			spell.world = {
				actions : actions,
				setPosition: _.bind( setPosition, this, spell.entityManager ),
				physics : {
					applyForce  : _.bind( applyForce, null, actions ), 
					applyTorque : _.bind( applyTorque, null, actions ),
					applyImpulse: _.bind( applyImpulse, null, actions )
				}
			}
		}		
		
		physics.prototype = {
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
				var bodies          = this.bodies,
					transformations = this.transformations,
					entityManager   = spell.entityManager
					
				applyPhysics( spell.world, entityManager, deltaTimeInMs, bodies, transformations )
				
				performCollisionDetection( entityManager, bodies, transformations )
			}
		}
		
		return physics
	}
)
