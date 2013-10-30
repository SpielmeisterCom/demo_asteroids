/**
 * @class demo_asteroids.system.debug
 * @singleton
 */

define(
	'demo_asteroids/system/debug',
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
		var debug = function( spell ) {
			
		}
		
		debug.prototype = {
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
				var bodies           = this.bodies,
					transformations  = this.transformations,
					entityManager    = spell.entityManager,
					renderingContext = spell.renderingContext,
					id, body, transform

				renderingContext.setLineColor( [ 1.0, 0.0, 1.0 ] )
				
				for( id in bodies ) {
					body = bodies[ id ]
					transform = transformations[ id ].translation
					
					renderingContext.drawCircle( transform[0], transform[1], body.radius, 1 )
				}				
			}
		}
		
		return debug
	}
)
