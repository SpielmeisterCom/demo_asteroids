define(
	'demo_asteroids/system/spacecraftIntegrator',
	function() {
		'use strict'


		var init = function( spell ) {
			this.physics = spell.world.physics
		}

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var spacecrafts   = this.spacecrafts,
				physics       = this.physics,
				spacecraft
				
			for( var id in spacecrafts ) {
				spacecraft = spacecrafts[ id ]

				var torque = spacecraft.torque

				if( torque ) {					
					physics.applyTorque( id, torque )
				}
				
				var force = spacecraft.force

				if( force[ 0 ] != 0 &&
					force[ 1 ] != 0 ) {					
						physics.applyForce( id, force )
				}
			}
		}


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
