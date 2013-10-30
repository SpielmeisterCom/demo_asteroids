define(
	'demo_asteroids/script/spawnAsteroids',
	[
		'spell/math/random/XorShift32',
		'spell/Defines',
		'spell/math/vec2',
		
		'spell/functions'
	],
	function(
		XorShift32,
		Defines,
		vec2,
		
		_
	) {
		'use strict'
		
		
		var prng = new XorShift32( 12345 )
		
		var nextCoordinate = function() {
			return prng.nextBetween( 100, 700 )
		}
		
		var nextVelocity = function() {
			return prng.nextBetween( -5, 5 )
		}		
		
		var ASTEROIDS_ENTITY_TEMPLATE_NAME = "demo_asteroids.entity.asteroid"
		var ASTEROID_COMPONENT_ID  = "demo_asteroids.component.asteroid"
		var SPAWN_NUMBER = 4
		var TRANSFORM_COMPONENT_ID = Defines.TRANSFORM_COMPONENT_ID
		var PHYSICS_COMPONENT_ID = "demo_asteroids.component.physicsBody"
		
		var spawnAsteroids = function( entityManager, parentAsteroidId, parentAsteroid ) {

			if( !parentAsteroidId || parentAsteroid.splitUps > 0 ) {
				for( var i = 0; i < SPAWN_NUMBER; i++ ) {
					var entityId = entityManager.createEntity( 
						{
							entityTemplateId: ASTEROIDS_ENTITY_TEMPLATE_NAME,
							config: {
								"spell.component.2d.transform": {
									translation: [ nextCoordinate(), nextCoordinate() ]
								},
								"demo_asteroids.component.physicsBody": {
									velocity: [ nextVelocity(), nextVelocity() ]
								}
							}
						}
					)
					
					if( parentAsteroidId ) {
						var transform = entityManager.getComponentById( parentAsteroidId, TRANSFORM_COMPONENT_ID )						

						entityManager.updateComponent( 
							entityId, 
							TRANSFORM_COMPONENT_ID, 
							{
								translation: transform.translation,
								scale: vec2.scale( [], transform.scale, 0.5 )
							}
							
						)
						
						var physicsBody = entityManager.getComponentById( parentAsteroidId, PHYSICS_COMPONENT_ID )

						entityManager.updateComponentAttribute( 
							entityId, 
							PHYSICS_COMPONENT_ID, 
							'radius', 
							physicsBody.radius * 0.5
						)
						
						entityManager.updateComponent( 
							entityId, 
							ASTEROID_COMPONENT_ID,
							{
								splitUps: parentAsteroid.splitUps - 1,
								points: parentAsteroid.points * 2
							}
						)
					}
				}
			}
		}
		
		
		return spawnAsteroids
	}
)
