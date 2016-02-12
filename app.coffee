{ Flexer } = require "npm"

cellStyle = 
	color: "#28affa"
	textAlign: "center"
	lineHeight: "100px"
	fontSize: "40px"
	fontWeight: 600
buttonStyle = 
	color: "#fff"
	textAlign: "center"
	lineHeight: "80px"
	fontSize: "28px"
	fontWeight: 400

# Create layer
layerA = new Layer
	borderRadius: 8
	backgroundColor: "#28affa"
	flex: 0.6
	flexDirection: "row"
	flexWrap: "wrap"
	justifyContent: "center"
	html: "Press the layers to scale up/down"
layerA.style = cellStyle
layerA.style.color = "#fff"
layerA.style.lineHeight = "800px"
	
# Create the grid layers
for index in [0...10]
		
	cell = new Layer
		borderRadius: 2
		backgroundColor: "#fff"
		parent: layerA
		fixedWidth: 100
		fixedHeight: 100
		html: index
		margin: 10
	cell.style = cellStyle
	cell.layout.curve = "spring(300, 40, 10)"
	cell.on Events.Click, (event, layer) ->
		layer.fixedWidth = if layer.fixedWidth is 200 then 100 else 200
		layer.fixedHeight = if layer.fixedHeight is 200 then 100 else 200
		layer.style.lineHeight = layer.fixedHeight + "px"

buttonContainer = new Layer
	top: Screen.height - 120
	flex: 0.2
	flexDirection: "row"
	borderRadius: 8
	backgroundColor: "#fff"
	justifyContent: "center"

buttons = [
	{label: "left", action: -> layerA.justifyContent = "flex-start"},
	{label: "center", action: -> layerA.justifyContent = "center"},
	{label: "right", action: -> layerA.justifyContent = "flex-end"}
	
]

for button, i in buttons
	buttonLayer = new Layer
		fixedHeight: 80
		fixedWidth: 150
		margin: 20
		borderRadius: 8
		html: button.label
		backgroundColor: "#28affa"
		superLayer: buttonContainer
	buttonLayer.style = buttonStyle
	
	buttonLayer.on Events.Click, button.action

directionContainer = new Layer
	top: Screen.height - 240
	flexDirection: "row"
	borderRadius: 8
	backgroundColor: "#fff"
	justifyContent: "center"

buttons = [
	{label: "row", action: -> layerA.flexDirection = "row"},
	{label: "column", action: -> layerA.flexDirection = "column"}
]

for button, i in buttons
	buttonLayer = new Layer
		fixedHeight: 80
		fixedWidth: 150
		margin: 20
		borderRadius: 8
		html: button.label
		backgroundColor: "#28affa"
		superLayer: directionContainer
	buttonLayer.style = buttonStyle
	
	buttonLayer.on Events.Click, button.action