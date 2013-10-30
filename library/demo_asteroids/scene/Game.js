define(
	'demo_asteroids/scene/Game',
	[
		'demo_asteroids/script/spawnAsteroids'
	],
	function(
		spawnAsteroids
		) {
		'use strict'


		return {
			init : function( spell, sceneConfig ) {
				spell.inputManager.addInputContext(
					'spaceshipControl',
					spell.assetManager.get( 'inputMap:demo_asteroids.asset.spacecraftInputMap' )
				)
				
				for( var i = 0; i< 1; i++ ) {
					spawnAsteroids( spell.entityManager )
				}
			},
			destroy : function( spell, sceneConfig ) {
				spell.inputManager.removeInputContext( 'spaceshipControl' )
			}
		}
	}
)
