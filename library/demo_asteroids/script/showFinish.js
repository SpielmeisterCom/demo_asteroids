define(
	'demo_asteroids/script/showFinish',
	[
		'spell/Defines'
	],
	function(
		Defines
	) {
		'use strict'
		
		var TRANSFORM_COMPONENT_ID = Defines.TRANSFORM_COMPONENT_ID
		
		return function( spell, entityManager ) {
			var processKeyDown = function( event ) {
				var keyCode = event.keyCode
				
				if( keyCode === spell.inputManager.KEY.ENTER ) {
					spell.inputManager.removeListener( 'keyDown', processKeyDown )
					spell.sceneManager.changeScene( 'demo_asteroids.scene.Game' )
				}
			}

			spell.inputManager.addListener( 'keyDown', processKeyDown )				
			
			var scoreId = entityManager.getEntityIdsByName( 'Highscore' )[0]
			
			var finishEntityId = entityManager.createEntity(
				{
					entityTemplateId: 'demo_asteroids.entity.Finish'
				}
			)
			
			entityManager.updateComponent( 
				scoreId, 
				TRANSFORM_COMPONENT_ID, 
				{
					translation: [ -70, -25 ]
				}
				
			)
			
			entityManager.changeParentEntity( scoreId, finishEntityId )
		}
	}
)
