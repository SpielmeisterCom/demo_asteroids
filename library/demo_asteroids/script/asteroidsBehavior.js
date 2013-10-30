define(
	'demo_asteroids/script/asteroidsBehavior',
	[
		'demo_asteroids/script/spawnAsteroids',
		
		'spell/functions'
	],
	function(
		spawnAsteroids,
		
		_
	) {
		'use strict'
		
		var ASTEROID_COMPONENT_ID  = "demo_asteroids.component.asteroid"
		var TEXT_APPEARANCE_COMPONENT_ID = 'spell.component.2d.graphics.textAppearance'
		
		var addPointsToHighScore = function( entityManager, points ) {
			var scoreEntities = entityManager.getEntityIdsByName( 'Score' ),
				entityId      = scoreEntities[ 0 ],
				textCmp       = entityManager.getComponentById( entityId, TEXT_APPEARANCE_COMPONENT_ID )
	
			entityManager.updateComponentAttribute( entityId, TEXT_APPEARANCE_COMPONENT_ID, "text", parseInt(textCmp.text) + parseInt( points ) )
		}

		var playExplosion = function( spell, type ) {
			var explosionType = type ? type + 1 : ''
			
			spell.audioContext.play( 
				spell.assetManager.get( 
					'sound:demo_asteroids.asset.sound.asteroidExplosion' + explosionType
				).resource,
				undefined,
				0.1
			)			
		}
		
		var onCollision = function( spell, entityId, collidedId, myCollisionGroupId, collisionGroupId ) {
			var entityManager = spell.entityManager
			
			if( collisionGroupId  === 3 ) {			
				entityManager.removeEntity( collidedId )
				
				var asteroid = entityManager.getComponentById( entityId, ASTEROID_COMPONENT_ID )
				spawnAsteroids( entityManager, entityId, asteroid )
				
				playExplosion( spell, asteroid.splitUps )				
				
				addPointsToHighScore( entityManager, asteroid.points )
				
				entityManager.removeEntity( entityId )					
			}
		}
		
		
		return {
			collision: onCollision		
		}
	}
)
