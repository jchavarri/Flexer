computeLayout = require "css-layout"

class Flexer extends Framer.EventEmitter

	@layoutProps = [
		"fixedWidth", "fixedHeight", 
		"minWidth", "minHeight", 
		"maxWidth", "maxHeight", 
		"left", "right", "top", "bottom", 
		"margin", "marginLeft", "marginRight", "marginTop", "marginBottom",
		"padding", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
		# "borderWidth", 
		"borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth",
		"flexDirection",
		"justifyContent",
		"alignItems", "alignSelf",
		"flex",
		"flexWrap",
		"position"
	]

	# A string to specify an animation for each new layout
	# It might be interesting to have a different value in a Layer basis
	curve: undefined

	constructor: (@layer) ->
		@layer.on("change:subLayers", @_subLayersChanged)
		# TODO Attach the listener only on root layers. Use @_sublayerChanged to modify accordingly
		Framer.Loop.on("update", @_drawIfNeeded)
		@layer._context.domEventManager.wrap(window).addEventListener("resize", @_didResize)
		# When the change:subLayers event is triggered, the 'superLayer' property has not been set yet, so we need a way to know
		# if we are dealing with a root layer (i.e. doesn't have any superLayer) or not
		# if isRoot
		# 	@_setupResizeListener()

		# This property contains everything needed in 'computeLayout' to make the calculations
		@_layoutNode =
			_default: true # Used to remove default flex later on
			style: {
				width: @layer.width, # Layers keep their original size by default
				height: @layer.height, # Layers keep their original size by default
			}
			children: []

		for property of Flexer.layoutProps
			if @layer[property]
				@_layoutNode.style[@_getLayoutProperty(property)] = @layer[property]
		
		@_updateTree
			added: @layer.children
			removed: []

	_didResize: =>
		if not @layer.superLayer
			@_setNeedsUpdate()

	# This is a temporary hack to maintain original 'width' and 'height'
	# We should add support for position 'relative' and 'absolute'
	_getLayoutProperty: (property) ->
		cssLayoutProperty = property
		# We rename 'width' and 'height' css-layout props to 'fixedWidth' and 'fixedHeight'
		# so we don't overwrite Framer original 'width' and 'height' Layer props 
		if cssLayoutProperty is "fixedWidth" then cssLayoutProperty = "width"
		if cssLayoutProperty is "fixedHeight" then cssLayoutProperty = "height"
		return cssLayoutProperty

	updateProperty: (property, value) ->
		if property
			# TODO Check if value exists
			# TODO Property removal?
			# TODO Check value changes from previous value
			# Remove the default 'flex' if is there
			if @_layoutNode._default
				delete @_layoutNode._default
				@_layoutNode.style = {}
			@_layoutNode.style[@_getLayoutProperty(property)] = value
		
		@_setNeedsUpdate()

	_subLayersChanged: (layersChanged) =>
		@_updateTree(layersChanged)
		@_setNeedsUpdate()

	_updateTree: (layersChanged) =>
		for layerAdded in layersChanged.added
			@_layoutNode.children.push(layerAdded.layout._layoutNode)
		for layerRemoved in layersChanged.removed
			@_layoutNode.children.splice(_layoutNode.indexOf(layerRemoved.layout._layoutNode), 1)

	_setNeedsUpdate: =>
		rootLayer = @layer
		while rootLayer.superLayer
			rootLayer = rootLayer.superLayer
		rootLayer.layout.needsUpdate = true

	_drawIfNeeded: =>
		if not @layer.superLayer and @needsUpdate
			@needsUpdate = false
			# Hack to add Screen size
			# Maybe should be added to Canvas
			rootLayoutNode =
				style:
					width: Screen.width
					height: Screen.height
				children: [@_layoutNode]
			# Deep cloning is required for computeLayout to work
			newTree = Framer._.cloneDeep(rootLayoutNode)
			computeLayout(newTree)
			@_updateLayer(newTree.children[0])

	_updateLayer: (computedTree) ->
		if computedTree.shouldUpdate
			if not @curve
				frame = 
					x: computedTree.layout.left
					y: computedTree.layout.top
					width: computedTree.layout.width
					height: computedTree.layout.height
				@layer.frame = frame
			else
				@layer.animate
					properties:
						x: computedTree.layout.left
						y: computedTree.layout.top
						width: computedTree.layout.width
						height: computedTree.layout.height
					curve: @curve
		for subLayer, i in @layer.subLayers
			if computedTree.children and computedTree.children.length > i
				subLayer.layout._updateLayer(computedTree.children[i])

# Adding 'layout' property to Layer
Layer.define "layout",
	get: ->
		@_layout ?= new Flexer(@)
		return @_layout

# Adding Flexer properties to Layer
for layoutProp in Flexer.layoutProps
	do (layoutProp) =>
		Layer.define layoutProp, 
			default: undefined
			get: -> 
				@_getPropertyValue layoutProp
			set: (value) ->
				@._setPropertyValue layoutProp, value
				# Set the layout attribute on Flexer
				@layout.updateProperty(layoutProp, value)

module.exports = Flexer