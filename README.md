# Flexer

Flexer is a FramerJS module that allows you to create flexible layouts. This means you can use proportions or relative values instead of absolute pixels to position and animate layers on your prototypes.

## Version 

0.0.1

**NOTE**: Flexer is in a very early stage of development, so unexpected behavior is... expected. All bug reports, feature requests, and general feedback are greatly appreciated! 👊

## 3-Step Installation

In order to install it, you will need [node/npm](https://nodejs.org/en/download/).

1. From your Framer project folder, type `npm install flexer`. Hint: You can add the `--save` flag if you want the package to appear in your project [dependencies](https://docs.npmjs.com/cli/install).
2. Create a file `npm.coffee` in your `modules` folder, with this line: `exports.flexer = require "flexer"`
3. Lastly, add the following line in `app.coffee` (or your main file): `{ flexer } = require "npm"`

For further information about modules, check the awesomic [Framer documentation](http://framerjs.com/docs/#modules.modules).

## Usage

Once you import Flexer, you will have all these properties available in your layers (from [css-layout readme](https://github.com/facebook/css-layout):

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

NOTE: `borderWidth` is not available at the moment due to conflicts with the existing `Layer` property.

## One more thing...

If you want to animate the layout transitions, you can use the `layout.curve` property of the layer. For example:

```coffeescript
layerA.layout.curve = "spring(300, 40, 10)" # Now all layout modifications on layerA and sublayers will be animated
```

## Thanks to

- [Koen Bok](http://github.com/koenbok) for open sourcing the amazing FramerJS library
- [Christopher Chedeau](https://github.com/vjeux) for open sourcing the amazing css-layout library
