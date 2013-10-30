define(
	'demo_asteroids/system/aiControl',
	[
		'spell/functions',

		'spell/math/vec2'
	],
	function(
		_,

		vec2
	) {
		'use strict'


		/**
		 * private
		 */

		var aimingAccuracy = 0.025, // in radians
			tmp            = vec2.create()


		var isAIControlled = function( actor ) {
			return actor.id === 'aiControlled'
		}

		var getNextTargetId = function( aiTransform, playerTransforms ) {
			return _.reduce(
				playerTransforms,
				function( memo, playerTransform, entityId ) {
					vec2.subtract( tmp, aiTransform.translation, playerTransform.translation )
					var distanceSquared = vec2.dot( tmp, tmp )

					if( distanceSquared < memo.distanceSquared ) {
						memo.id = entityId
						memo.distanceSquared = distanceSquared
					}

					return memo
				},
				{
					id : undefined,
					distanceSquared : Number.POSITIVE_INFINITY
				}
			).id
		}

		var updateActor = function( aiActor, aiTransform, targetTransform ) {
			vec2.subtract( tmp, targetTransform.translation, aiTransform.translation )
			vec2.normalize( tmp, tmp )

			var deltaAngle = Math.atan2( tmp[ 0 ], tmp[ 1 ] ) - aiTransform.rotation
			deltaAngle += ( deltaAngle > Math.PI ) ? -2 * Math.PI : ( deltaAngle < -Math.PI ) ? 2 * Math.PI : 0

			var actions = aiActor.actions
			actions.steerLeft.executing  = deltaAngle < -aimingAccuracy
			actions.steerRight.executing = deltaAngle > aimingAccuracy
			actions.accelerate.executing = Math.abs( deltaAngle ) < aimingAccuracy
		}

		var updateActors = function( spell, timeInMs, deltaTimeInMs ) {
			var actors     = this.actors,
				transforms = this.transforms

			// NOTE: Distinguishing between ai and player controlled actors should be done by using separate component types in order to save some cycles here.
			var aiControlledIds = [],
				playerControlledIds = []

			_.each(
				actors,
				function( actor, entityId ) {
					if( isAIControlled( actor ) ) {
						aiControlledIds.push( entityId )

					} else {
						playerControlledIds.push( entityId )
					}
				}
			)

			var targetTransforms = _.pick( transforms, playerControlledIds )

			_.each(
				aiControlledIds,
				function( aiControlledId ) {
					var targetId = getNextTargetId( transforms[ aiControlledId ], targetTransforms )

					if( targetId ) {
						updateActor( actors[ aiControlledId ], transforms[ aiControlledId ], targetTransforms[ targetId ] )
					}
				}
			)
		}

		var init = function( spell ) {}


		/**
		 * public
		 */

		var AIControl = function( spell ) {}

		AIControl.prototype = {
			init : init,
			destroy : function() {},
			activate : function() {},
			deactivate : function() {},
			process : updateActors
		}

		return AIControl
	}
)
