define(
	'demo_asteroids/system/spacecraftIntegrator',
	function() {
		'use strict'


		/**
		 * private
		 */

		var spacecraftTorque = 1

		var applyActionsToSpacecrafts = function( world, deltaTimeInS, actors, spacecrafts, transforms ) {
			for( var id in actors ) {
				var actions    = actors[ id ].actions,
					transform  = transforms[ id ],
					spacecraft = spacecrafts[ id ]

				var rotationDirection = ( actions.steerLeft.executing ?
					1 :
					( actions.steerRight.executing ?
						-1 :
						0
					)
				)

				var torque = ( rotationDirection ?
					spacecraftTorque * rotationDirection :
					undefined
				)

				if( torque ) {
					world.applyTorque( id, torque )
				}

				if( actions.accelerate.executing ) {
					var rotation      = transform.rotation,
						thrusterForce = spacecraft.thrusterForce,
						force         = [ Math.sin( -rotation ) * thrusterForce, Math.cos( rotation ) * thrusterForce ]

					world.applyForce( id, force )
				}
			}
		}

		var init = function( spell ) {
			this.world = spell.box2dWorlds.main
		}

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			applyActionsToSpacecrafts( this.world, deltaTimeInMs, this.actors, this.spacecrafts, this.transforms )
		}


		/**
		 * public
		 */

		var SpacecraftIntegrator = function( spell ) {}

		SpacecraftIntegrator.prototype = {
			init : init,
			destroy : function() {},
			activate : function() {},
			deactivate : function() {},
			process : process
		}

		return SpacecraftIntegrator
	}
)
