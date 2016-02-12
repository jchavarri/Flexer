# Flexer

Flexer is a FramerJS module that allows you to create flexible layouts. This means you can use proportions or relative values instead of absolute pixels to position and animate layers on your prototypes.

**NOTE**: Flexer is in a very early stage of development, so unexpected behavior is... expected. It's a work in progress. All bug reports, feature requests, and general feedback are greatly appreciated! 👊

## Demo

- [Main demo](http://jchavarri.github.io/Flexer/)(wip). You can check the code in the [gh-pages branch](https://github.com/jchavarri/Flexer/tree/gh-pages). 
- [Animated accordion menu demo](http://share.framerjs.com/zzrns0ixovna/) in less than 20 lines of code.

## 3-Step Installation

In order to install it, you will need [node/npm](https://nodejs.org/en/download/).

1. From your Framer project folder, type `npm install flexer`. Hint: You can add the `--save` flag if you want the package to appear in your project [dependencies](https://docs.npmjs.com/cli/install).
2. Create a file `npm.coffee` in your `modules` folder, with this line: `exports.flexer = require "flexer"`
3. Lastly, add the following line in `app.coffee` (or your main file): `{ flexer } = require "npm"`

For further information about modules, check the awesomic [Framer documentation](http://framerjs.com/docs/#modules.modules).

## How does it work?

Once you import the module on your main file, Flexer will add the properties listed below to the `Layer` class. Flexer tries to not be intrusive and doesn't modify your layers until you use one of these properties.

This means you can have in the same project some layers with the default Framer layout (using `x`, `y`, `width`, `height`) and other layers with a flexible layout.

NOTE: Once a layer becomes *flexible*, you should use `left`, `right`, `top`, `bottom` and `fixedWidth`, `fixedHeight` instead of `x`, `y`, `width`, `height`.

## Properties added to `Layer`

From [css-layout readme](https://github.com/facebook/css-layout):

- `fixedWidth`, `fixedHeight`: positive number (animatable)
- `minWidth`, `minHeight`: positive number (animatable)
- `maxWidth`, `maxHeight`: positive number (animatable)
- `left`, `right`, `top`, `bottom`: number (animatable)
- `margin`, `marginLeft`, `marginRight`, `marginTop`, `marginBottom`: number (animatable)
- `padding`, `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`: positive number (animatable)
- `borderLeftWidth`, `borderRightWidth`, `borderTopWidth`, `borderBottomWidth`: positive number (animatable)
- `flexDirection`: 'column', 'row'
- `justifyContent`: 'flex-start', 'center', 'flex-end', 'space-between', 'space-around'
- `alignItems`, `alignSelf`: 'flex-start', 'center', 'flex-end', 'stretch'
- `flex`: positive number (animatable)
- `flexWrap`: 'wrap', 'nowrap'
- `position`: 'relative', 'absolute'

NOTE: `borderWidth` is not available for now, until I find a way to solve the conflict with the existing `Layer` property.

## One more thing...

If you want to animate the layout transitions, you can use the `layout.curve` property of the layer. For example:

```coffeescript
	# Now all layout modifications on layerA and sublayers 
	# will be animated
	layerA.layout.curve = "spring(300, 40, 10)"
```

## Thanks to

- [Koen Bok](http://github.com/koenbok) for open sourcing the amazing FramerJS library
- [Christopher Chedeau](https://github.com/vjeux) for open sourcing the amazing css-layout library
