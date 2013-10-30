define(
	'demo_asteroids/script/startButtonHandler',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'
		
		
		return {
			pointerOver : function( spell, entityId ) {
			},

			pointerOut : function( spell, entityId ) {
			},

			pointerDown : function( spell, entityId ) {
				spell.sceneManager.changeScene( 'demo_asteroids.scene.Game' )
			}
		}
	}
)
