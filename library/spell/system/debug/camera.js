/**
 * @class spell.system.debug.camera
 * @singleton
 */

define(
	'spell/system/debug/camera',
	[
		'spell/script/editor/cameraMover',
		'spell/script/editor/entityMover',
		'spell/script/editor/selectedEntityHighlighter',
		'spell/script/editor/entityRemover',

		'spell/script/editor/tilemapEditor',

		'spell/math/vec2',
		'spell/math/mat3',
        'spell/shared/util/create',
		'spell/functions'
	],
	function(
		cameraMover,
		entityMover,
		selectedEntityHighlighter,
		entityRemover,
		tilemapEditor,

		vec2,
		mat3,

        create,
		_
		) {
		'use strict'

		var PLUGIN_MANIFEST = {
		    'cameraMover':                  cameraMover,
	        'entityMover':                  entityMover,
	        'entityRemover':                entityRemover,
	        'selectedEntityHighlighter':    selectedEntityHighlighter,
	        'tilemapEditor':                tilemapEditor
		};


		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var interactiveEditingSystem = function( spell ) {

			/**
			 * Array holding a list of blacklisted plugins (plugins, that are not activated by default and can't be activated)
			 * @type {Array}
			 */
			this.blacklistedPlugins = []

			/**
			 * Array holding a list of all plugins that a currently active
			 * @type {Array}
			 */
			this.activePlugins = []

			/**
			 * Map holding pluginName => pluginInstance
			 * @type {Object}
			 */
			this.plugins = {}

			/**
			 * Reference to the spell object
			 */
			this.spell      = spell

			this.commandMode                = false

			/**
			 * The entityId of the currently selected entity
			 */
			this.selectedEntity             = null

			/**
			 * vec2 holding holding the current position of the pointer in world coordinates
			 * (null unless initialized
			 * @type {null}
			 */
			this.cursorWorldPosition        = null

		}

		//private
		var invokePlugins = function( plugins, pluginNames, functionName ) {
			var args = Array.prototype.slice.call(arguments, 3);

			for( var i = 0; i < pluginNames.length; i++ ) {
				var pluginName          = pluginNames[ i ],
					pluginInstance      = plugins[ pluginName ]

				if( !pluginInstance ) {
					continue
				}

				var	fn                  = pluginInstance.prototype[ functionName ]

				if ( fn ) {
					fn.apply( pluginInstance, args )
				}
			}
		}

		var processEvent = function ( spell, event ) {

			var KEY = spell.inputManager.KEY

			if(event.position) {
				this.cursorWorldPosition = spell.renderingContext.transformScreenToWorld( event.position )
			}

			if(event.type == 'keyDown' &&  event.keyCode == KEY.CTRL || event.keyCode == KEY.LEFT_WINDOW_KEY) {
				this.commandMode = true

			} else if(event.type == 'keyUp' &&  event.keyCode == KEY.CTRL || event.keyCode == KEY.LEFT_WINDOW_KEY) {
				this.commandMode = false
			}

			invokePlugins( this.plugins, this.activePlugins, event.type, spell, this, event )
		}

		var checkPermission = function( entityId, permission ) {
			var editorConfigurations = this.editorConfigurations,
				editorConfiguration  = editorConfigurations[ entityId ]

			if( editorConfiguration && editorConfiguration[ permission ] === false) {
				return false
			} else {
				return true
			}
		}

		//public
		interactiveEditingSystem.prototype = {
			setSelectedEntity: function( entityId ) {
				this.selectedEntity = entityId
/*
				this.spell.sendMessageToEditor(
					'spelled.debug.entity.select',
					{
						id: entityId
					}
				)


*/
			},

			isMoveable: function( entityId ) {
				return checkPermission.call( this, entityId, 'isMoveable' )
			},

			isCloneable: function ( entityId ) {
				return checkPermission.call( this, entityId, 'isCloneable' )
			},

			isSelectable: function( entityId ) {
				return checkPermission.call( this, entityId, 'isSelectable' )
			},

			isRemovable: function( entityId ) {
				return checkPermission.call( this, entityId, 'isRemovable' )
			},

			getSelectedEntity: function( entityId ) {
				return this.selectedEntity
			},

			activatePlugin: function(pluginName) {
				if( !this.plugins[ pluginName ] ) {
					//plugin is not available
					return
				}

				this.activePlugins.push(pluginName)

				invokePlugins( this.plugins, [pluginName], 'activate', this.spell, this)
			},

			activateAllPlugins: function() {
				this.activePlugins = _.keys(PLUGIN_MANIFEST)

				invokePlugins( this.plugins, this.activePlugins, 'activate', this.spell, this)
			},

			deactivatePlugin: function( pluginName ) {
				var plugins         = this.plugins,
					activePlugins   = this.activePlugins,
					spell           = this.spell,
					me              = this

				this.activePlugins = _.filter(
					activePlugins,
					function( pluginNameIter ) {
						if( pluginNameIter === pluginName ) {
							invokePlugins( plugins, [ pluginName ], 'deactivate', spell, me)

							return false
						}

						return true
					}
				)
			},

			deactivateAllPlugins: function() {
				invokePlugins( this.plugins, this.activePlugins, 'deactivate', this.spell, this)
				this.activePlugins = []
			},

			/**
			 * Gets called when the system is created.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {
			    this.blacklistedPlugins = this.config.deactivatedPlugins

				if (this.config.selectedEntityId) {
					this.selectedEntity     = this.config.selectedEntityId
				}

				this.activePlugins = []
				for (var pluginName in PLUGIN_MANIFEST) {

					if ( _.indexOf(this.blacklistedPlugins, pluginName) !== -1 ) {
						//if this plugin is blacklisted, ignore it completly
						continue
					}

					var pluginConstructor = PLUGIN_MANIFEST[ pluginName ],
						pluginInstance = create(pluginConstructor, [ spell, this ], { })

					this.plugins[ pluginName ] = pluginInstance

					this.activePlugins.push(pluginName)
				}

				invokePlugins( this.plugins, this.activePlugins, 'init', spell, this)
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
				this.prototype.activateAllPlugins.call( this )
			},

			/**
			 * Gets called when the system is deactivated.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			deactivate: function( spell ) {
				this.prototype.deactivateAllPlugins.call( this )
			},

			/**
			 * Gets called to trigger the processing of game state.
			 *
			 * @param {Object} [spell] The spell object.
			 * @param {Object} [timeInMs] The current time in ms.
			 * @param {Object} [deltaTimeInMs] The elapsed time in ms.
			 */
			process: function( spell, timeInMs, deltaTimeInMs ) {

				//process event queue
				var inputEvents      = spell.inputManager.getInputEvents()
				for( var i = 0, numInputEvents = inputEvents.length; i < numInputEvents; i++ ) {

					processEvent.call( this, spell, inputEvents[ i ] )

				}

				invokePlugins( this.plugins, this.activePlugins, 'process', spell, this, timeInMs, deltaTimeInMs)

				//consume all input events if we're in commandMode
				if( this.commandMode == true ) {
					spell.inputManager.clearInputEvents()
				}
			}
		}

		return interactiveEditingSystem
	}
)
