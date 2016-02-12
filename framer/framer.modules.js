require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// UMD (Universal Module Definition)
// See https://github.com/umdjs/umd for reference
//
// This file uses the following specific UMD implementation:
// https://github.com/umdjs/umd/blob/master/returnExports.js
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.computeLayout = factory();
  }
}(this, function() {
  /**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var computeLayout = (function() {

  var CSS_UNDEFINED;

  var CSS_DIRECTION_INHERIT = 'inherit';
  var CSS_DIRECTION_LTR = 'ltr';
  var CSS_DIRECTION_RTL = 'rtl';

  var CSS_FLEX_DIRECTION_ROW = 'row';
  var CSS_FLEX_DIRECTION_ROW_REVERSE = 'row-reverse';
  var CSS_FLEX_DIRECTION_COLUMN = 'column';
  var CSS_FLEX_DIRECTION_COLUMN_REVERSE = 'column-reverse';

  var CSS_JUSTIFY_FLEX_START = 'flex-start';
  var CSS_JUSTIFY_CENTER = 'center';
  var CSS_JUSTIFY_FLEX_END = 'flex-end';
  var CSS_JUSTIFY_SPACE_BETWEEN = 'space-between';
  var CSS_JUSTIFY_SPACE_AROUND = 'space-around';

  var CSS_ALIGN_FLEX_START = 'flex-start';
  var CSS_ALIGN_CENTER = 'center';
  var CSS_ALIGN_FLEX_END = 'flex-end';
  var CSS_ALIGN_STRETCH = 'stretch';

  var CSS_POSITION_RELATIVE = 'relative';
  var CSS_POSITION_ABSOLUTE = 'absolute';

  var leading = {
    'row': 'left',
    'row-reverse': 'right',
    'column': 'top',
    'column-reverse': 'bottom'
  };
  var trailing = {
    'row': 'right',
    'row-reverse': 'left',
    'column': 'bottom',
    'column-reverse': 'top'
  };
  var pos = {
    'row': 'left',
    'row-reverse': 'right',
    'column': 'top',
    'column-reverse': 'bottom'
  };
  var dim = {
    'row': 'width',
    'row-reverse': 'width',
    'column': 'height',
    'column-reverse': 'height'
  };

  // When transpiled to Java / C the node type has layout, children and style
  // properties. For the JavaScript version this function adds these properties
  // if they don't already exist.
  function fillNodes(node) {
    if (!node.layout || node.isDirty) {
      node.layout = {
        width: undefined,
        height: undefined,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      };
    }

    if (!node.style) {
      node.style = {};
    }

    if (!node.children) {
      node.children = [];
    }
    node.children.forEach(fillNodes);
    return node;
  }

  function isUndefined(value) {
    return value === undefined;
  }

  function isRowDirection(flexDirection) {
    return flexDirection === CSS_FLEX_DIRECTION_ROW ||
           flexDirection === CSS_FLEX_DIRECTION_ROW_REVERSE;
  }

  function isColumnDirection(flexDirection) {
    return flexDirection === CSS_FLEX_DIRECTION_COLUMN ||
           flexDirection === CSS_FLEX_DIRECTION_COLUMN_REVERSE;
  }

  function getLeadingMargin(node, axis) {
    if (node.style.marginStart !== undefined && isRowDirection(axis)) {
      return node.style.marginStart;
    }

    var value = null;
    switch (axis) {
      case 'row':            value = node.style.marginLeft;   break;
      case 'row-reverse':    value = node.style.marginRight;  break;
      case 'column':         value = node.style.marginTop;    break;
      case 'column-reverse': value = node.style.marginBottom; break;
    }

    if (value !== undefined) {
      return value;
    }

    if (node.style.margin !== undefined) {
      return node.style.margin;
    }

    return 0;
  }

  function getTrailingMargin(node, axis) {
    if (node.style.marginEnd !== undefined && isRowDirection(axis)) {
      return node.style.marginEnd;
    }

    var value = null;
    switch (axis) {
      case 'row':            value = node.style.marginRight;  break;
      case 'row-reverse':    value = node.style.marginLeft;   break;
      case 'column':         value = node.style.marginBottom; break;
      case 'column-reverse': value = node.style.marginTop;    break;
    }

    if (value != null) {
      return value;
    }

    if (node.style.margin !== undefined) {
      return node.style.margin;
    }

    return 0;
  }

  function getLeadingPadding(node, axis) {
    if (node.style.paddingStart !== undefined && node.style.paddingStart >= 0
        && isRowDirection(axis)) {
      return node.style.paddingStart;
    }

    var value = null;
    switch (axis) {
      case 'row':            value = node.style.paddingLeft;   break;
      case 'row-reverse':    value = node.style.paddingRight;  break;
      case 'column':         value = node.style.paddingTop;    break;
      case 'column-reverse': value = node.style.paddingBottom; break;
    }

    if (value != null && value >= 0) {
      return value;
    }

    if (node.style.padding !== undefined && node.style.padding >= 0) {
      return node.style.padding;
    }

    return 0;
  }

  function getTrailingPadding(node, axis) {
    if (node.style.paddingEnd !== undefined && node.style.paddingEnd >= 0
        && isRowDirection(axis)) {
      return node.style.paddingEnd;
    }

    var value = null;
    switch (axis) {
      case 'row':            value = node.style.paddingRight;  break;
      case 'row-reverse':    value = node.style.paddingLeft;   break;
      case 'column':         value = node.style.paddingBottom; break;
      case 'column-reverse': value = node.style.paddingTop;    break;
    }

    if (value != null && value >= 0) {
      return value;
    }

    if (node.style.padding !== undefined && node.style.padding >= 0) {
      return node.style.padding;
    }

    return 0;
  }

  function getLeadingBorder(node, axis) {
    if (node.style.borderStartWidth !== undefined && node.style.borderStartWidth >= 0
        && isRowDirection(axis)) {
      return node.style.borderStartWidth;
    }

    var value = null;
    switch (axis) {
      case 'row':            value = node.style.borderLeftWidth;   break;
      case 'row-reverse':    value = node.style.borderRightWidth;  break;
      case 'column':         value = node.style.borderTopWidth;    break;
      case 'column-reverse': value = node.style.borderBottomWidth; break;
    }

    if (value != null && value >= 0) {
      return value;
    }

    if (node.style.borderWidth !== undefined && node.style.borderWidth >= 0) {
      return node.style.borderWidth;
    }

    return 0;
  }

  function getTrailingBorder(node, axis) {
    if (node.style.borderEndWidth !== undefined && node.style.borderEndWidth >= 0
        && isRowDirection(axis)) {
      return node.style.borderEndWidth;
    }

    var value = null;
    switch (axis) {
      case 'row':            value = node.style.borderRightWidth;  break;
      case 'row-reverse':    value = node.style.borderLeftWidth;   break;
      case 'column':         value = node.style.borderBottomWidth; break;
      case 'column-reverse': value = node.style.borderTopWidth;    break;
    }

    if (value != null && value >= 0) {
      return value;
    }

    if (node.style.borderWidth !== undefined && node.style.borderWidth >= 0) {
      return node.style.borderWidth;
    }

    return 0;
  }

  function getLeadingPaddingAndBorder(node, axis) {
    return getLeadingPadding(node, axis) + getLeadingBorder(node, axis);
  }

  function getTrailingPaddingAndBorder(node, axis) {
    return getTrailingPadding(node, axis) + getTrailingBorder(node, axis);
  }

  function getBorderAxis(node, axis) {
    return getLeadingBorder(node, axis) + getTrailingBorder(node, axis);
  }

  function getMarginAxis(node, axis) {
    return getLeadingMargin(node, axis) + getTrailingMargin(node, axis);
  }

  function getPaddingAndBorderAxis(node, axis) {
    return getLeadingPaddingAndBorder(node, axis) +
        getTrailingPaddingAndBorder(node, axis);
  }

  function getJustifyContent(node) {
    if (node.style.justifyContent) {
      return node.style.justifyContent;
    }
    return 'flex-start';
  }

  function getAlignContent(node) {
    if (node.style.alignContent) {
      return node.style.alignContent;
    }
    return 'flex-start';
  }

  function getAlignItem(node, child) {
    if (child.style.alignSelf) {
      return child.style.alignSelf;
    }
    if (node.style.alignItems) {
      return node.style.alignItems;
    }
    return 'stretch';
  }

  function resolveAxis(axis, direction) {
    if (direction === CSS_DIRECTION_RTL) {
      if (axis === CSS_FLEX_DIRECTION_ROW) {
        return CSS_FLEX_DIRECTION_ROW_REVERSE;
      } else if (axis === CSS_FLEX_DIRECTION_ROW_REVERSE) {
        return CSS_FLEX_DIRECTION_ROW;
      }
    }

    return axis;
  }

  function resolveDirection(node, parentDirection) {
    var direction;
    if (node.style.direction) {
      direction = node.style.direction;
    } else {
      direction = CSS_DIRECTION_INHERIT;
    }

    if (direction === CSS_DIRECTION_INHERIT) {
      direction = (parentDirection === undefined ? CSS_DIRECTION_LTR : parentDirection);
    }

    return direction;
  }

  function getFlexDirection(node) {
    if (node.style.flexDirection) {
      return node.style.flexDirection;
    }
    return CSS_FLEX_DIRECTION_COLUMN;
  }

  function getCrossFlexDirection(flexDirection, direction) {
    if (isColumnDirection(flexDirection)) {
      return resolveAxis(CSS_FLEX_DIRECTION_ROW, direction);
    } else {
      return CSS_FLEX_DIRECTION_COLUMN;
    }
  }

  function getPositionType(node) {
    if (node.style.position) {
      return node.style.position;
    }
    return 'relative';
  }

  function isFlex(node) {
    return (
      getPositionType(node) === CSS_POSITION_RELATIVE &&
      node.style.flex > 0
    );
  }

  function isFlexWrap(node) {
    return node.style.flexWrap === 'wrap';
  }

  function getDimWithMargin(node, axis) {
    return node.layout[dim[axis]] + getMarginAxis(node, axis);
  }

  function isDimDefined(node, axis) {
    return node.style[dim[axis]] !== undefined && node.style[dim[axis]] >= 0;
  }

  function isPosDefined(node, pos) {
    return node.style[pos] !== undefined;
  }

  function isMeasureDefined(node) {
    return node.style.measure !== undefined;
  }

  function getPosition(node, pos) {
    if (node.style[pos] !== undefined) {
      return node.style[pos];
    }
    return 0;
  }

  function boundAxis(node, axis, value) {
    var min = {
      'row': node.style.minWidth,
      'row-reverse': node.style.minWidth,
      'column': node.style.minHeight,
      'column-reverse': node.style.minHeight
    }[axis];

    var max = {
      'row': node.style.maxWidth,
      'row-reverse': node.style.maxWidth,
      'column': node.style.maxHeight,
      'column-reverse': node.style.maxHeight
    }[axis];

    var boundValue = value;
    if (max !== undefined && max >= 0 && boundValue > max) {
      boundValue = max;
    }
    if (min !== undefined && min >= 0 && boundValue < min) {
      boundValue = min;
    }
    return boundValue;
  }

  function fmaxf(a, b) {
    if (a > b) {
      return a;
    }
    return b;
  }

  // When the user specifically sets a value for width or height
  function setDimensionFromStyle(node, axis) {
    // The parent already computed us a width or height. We just skip it
    if (node.layout[dim[axis]] !== undefined) {
      return;
    }
    // We only run if there's a width or height defined
    if (!isDimDefined(node, axis)) {
      return;
    }

    // The dimensions can never be smaller than the padding and border
    node.layout[dim[axis]] = fmaxf(
      boundAxis(node, axis, node.style[dim[axis]]),
      getPaddingAndBorderAxis(node, axis)
    );
  }

  function setTrailingPosition(node, child, axis) {
    child.layout[trailing[axis]] = node.layout[dim[axis]] -
        child.layout[dim[axis]] - child.layout[pos[axis]];
  }

  // If both left and right are defined, then use left. Otherwise return
  // +left or -right depending on which is defined.
  function getRelativePosition(node, axis) {
    if (node.style[leading[axis]] !== undefined) {
      return getPosition(node, leading[axis]);
    }
    return -getPosition(node, trailing[axis]);
  }

  function layoutNodeImpl(node, parentMaxWidth, /*css_direction_t*/parentDirection) {
    var/*css_direction_t*/ direction = resolveDirection(node, parentDirection);
    var/*(c)!css_flex_direction_t*//*(java)!int*/ mainAxis = resolveAxis(getFlexDirection(node), direction);
    var/*(c)!css_flex_direction_t*//*(java)!int*/ crossAxis = getCrossFlexDirection(mainAxis, direction);
    var/*(c)!css_flex_direction_t*//*(java)!int*/ resolvedRowAxis = resolveAxis(CSS_FLEX_DIRECTION_ROW, direction);

    // Handle width and height style attributes
    setDimensionFromStyle(node, mainAxis);
    setDimensionFromStyle(node, crossAxis);

    // Set the resolved resolution in the node's layout
    node.layout.direction = direction;

    // The position is set by the parent, but we need to complete it with a
    // delta composed of the margin and left/top/right/bottom
    node.layout[leading[mainAxis]] += getLeadingMargin(node, mainAxis) +
      getRelativePosition(node, mainAxis);
    node.layout[trailing[mainAxis]] += getTrailingMargin(node, mainAxis) +
      getRelativePosition(node, mainAxis);
    node.layout[leading[crossAxis]] += getLeadingMargin(node, crossAxis) +
      getRelativePosition(node, crossAxis);
    node.layout[trailing[crossAxis]] += getTrailingMargin(node, crossAxis) +
      getRelativePosition(node, crossAxis);

    // Inline immutable values from the target node to avoid excessive method
    // invocations during the layout calculation.
    var/*int*/ childCount = node.children.length;
    var/*float*/ paddingAndBorderAxisResolvedRow = getPaddingAndBorderAxis(node, resolvedRowAxis);

    if (isMeasureDefined(node)) {
      var/*bool*/ isResolvedRowDimDefined = !isUndefined(node.layout[dim[resolvedRowAxis]]);

      var/*float*/ width = CSS_UNDEFINED;
      if (isDimDefined(node, resolvedRowAxis)) {
        width = node.style.width;
      } else if (isResolvedRowDimDefined) {
        width = node.layout[dim[resolvedRowAxis]];
      } else {
        width = parentMaxWidth -
          getMarginAxis(node, resolvedRowAxis);
      }
      width -= paddingAndBorderAxisResolvedRow;

      // We only need to give a dimension for the text if we haven't got any
      // for it computed yet. It can either be from the style attribute or because
      // the element is flexible.
      var/*bool*/ isRowUndefined = !isDimDefined(node, resolvedRowAxis) && !isResolvedRowDimDefined;
      var/*bool*/ isColumnUndefined = !isDimDefined(node, CSS_FLEX_DIRECTION_COLUMN) &&
        isUndefined(node.layout[dim[CSS_FLEX_DIRECTION_COLUMN]]);

      // Let's not measure the text if we already know both dimensions
      if (isRowUndefined || isColumnUndefined) {
        var/*css_dim_t*/ measureDim = node.style.measure(
          /*(c)!node->context,*/
          /*(java)!layoutContext.measureOutput,*/
          width
        );
        if (isRowUndefined) {
          node.layout.width = measureDim.width +
            paddingAndBorderAxisResolvedRow;
        }
        if (isColumnUndefined) {
          node.layout.height = measureDim.height +
            getPaddingAndBorderAxis(node, CSS_FLEX_DIRECTION_COLUMN);
        }
      }
      if (childCount === 0) {
        return;
      }
    }

    var/*bool*/ isNodeFlexWrap = isFlexWrap(node);

    var/*css_justify_t*/ justifyContent = getJustifyContent(node);

    var/*float*/ leadingPaddingAndBorderMain = getLeadingPaddingAndBorder(node, mainAxis);
    var/*float*/ leadingPaddingAndBorderCross = getLeadingPaddingAndBorder(node, crossAxis);
    var/*float*/ paddingAndBorderAxisMain = getPaddingAndBorderAxis(node, mainAxis);
    var/*float*/ paddingAndBorderAxisCross = getPaddingAndBorderAxis(node, crossAxis);

    var/*bool*/ isMainDimDefined = !isUndefined(node.layout[dim[mainAxis]]);
    var/*bool*/ isCrossDimDefined = !isUndefined(node.layout[dim[crossAxis]]);
    var/*bool*/ isMainRowDirection = isRowDirection(mainAxis);

    var/*int*/ i;
    var/*int*/ ii;
    var/*css_node_t**/ child;
    var/*(c)!css_flex_direction_t*//*(java)!int*/ axis;

    var/*css_node_t**/ firstAbsoluteChild = null;
    var/*css_node_t**/ currentAbsoluteChild = null;

    var/*float*/ definedMainDim = CSS_UNDEFINED;
    if (isMainDimDefined) {
      definedMainDim = node.layout[dim[mainAxis]] - paddingAndBorderAxisMain;
    }

    // We want to execute the next two loops one per line with flex-wrap
    var/*int*/ startLine = 0;
    var/*int*/ endLine = 0;
    // var/*int*/ nextOffset = 0;
    var/*int*/ alreadyComputedNextLayout = 0;
    // We aggregate the total dimensions of the container in those two variables
    var/*float*/ linesCrossDim = 0;
    var/*float*/ linesMainDim = 0;
    var/*int*/ linesCount = 0;
    while (endLine < childCount) {
      // <Loop A> Layout non flexible children and count children by type

      // mainContentDim is accumulation of the dimensions and margin of all the
      // non flexible children. This will be used in order to either set the
      // dimensions of the node if none already exist, or to compute the
      // remaining space left for the flexible children.
      var/*float*/ mainContentDim = 0;

      // There are three kind of children, non flexible, flexible and absolute.
      // We need to know how many there are in order to distribute the space.
      var/*int*/ flexibleChildrenCount = 0;
      var/*float*/ totalFlexible = 0;
      var/*int*/ nonFlexibleChildrenCount = 0;

      // Use the line loop to position children in the main axis for as long
      // as they are using a simple stacking behaviour. Children that are
      // immediately stacked in the initial loop will not be touched again
      // in <Loop C>.
      var/*bool*/ isSimpleStackMain =
          (isMainDimDefined && justifyContent === CSS_JUSTIFY_FLEX_START) ||
          (!isMainDimDefined && justifyContent !== CSS_JUSTIFY_CENTER);
      var/*int*/ firstComplexMain = (isSimpleStackMain ? childCount : startLine);

      // Use the initial line loop to position children in the cross axis for
      // as long as they are relatively positioned with alignment STRETCH or
      // FLEX_START. Children that are immediately stacked in the initial loop
      // will not be touched again in <Loop D>.
      var/*bool*/ isSimpleStackCross = true;
      var/*int*/ firstComplexCross = childCount;

      var/*css_node_t**/ firstFlexChild = null;
      var/*css_node_t**/ currentFlexChild = null;

      var/*float*/ mainDim = leadingPaddingAndBorderMain;
      var/*float*/ crossDim = 0;

      var/*float*/ maxWidth;
      for (i = startLine; i < childCount; ++i) {
        child = node.children[i];
        child.lineIndex = linesCount;

        child.nextAbsoluteChild = null;
        child.nextFlexChild = null;

        var/*css_align_t*/ alignItem = getAlignItem(node, child);

        // Pre-fill cross axis dimensions when the child is using stretch before
        // we call the recursive layout pass
        if (alignItem === CSS_ALIGN_STRETCH &&
            getPositionType(child) === CSS_POSITION_RELATIVE &&
            isCrossDimDefined &&
            !isDimDefined(child, crossAxis)) {
          child.layout[dim[crossAxis]] = fmaxf(
            boundAxis(child, crossAxis, node.layout[dim[crossAxis]] -
              paddingAndBorderAxisCross - getMarginAxis(child, crossAxis)),
            // You never want to go smaller than padding
            getPaddingAndBorderAxis(child, crossAxis)
          );
        } else if (getPositionType(child) === CSS_POSITION_ABSOLUTE) {
          // Store a private linked list of absolutely positioned children
          // so that we can efficiently traverse them later.
          if (firstAbsoluteChild === null) {
            firstAbsoluteChild = child;
          }
          if (currentAbsoluteChild !== null) {
            currentAbsoluteChild.nextAbsoluteChild = child;
          }
          currentAbsoluteChild = child;

          // Pre-fill dimensions when using absolute position and both offsets for the axis are defined (either both
          // left and right or top and bottom).
          for (ii = 0; ii < 2; ii++) {
            axis = (ii !== 0) ? CSS_FLEX_DIRECTION_ROW : CSS_FLEX_DIRECTION_COLUMN;
            if (!isUndefined(node.layout[dim[axis]]) &&
                !isDimDefined(child, axis) &&
                isPosDefined(child, leading[axis]) &&
                isPosDefined(child, trailing[axis])) {
              child.layout[dim[axis]] = fmaxf(
                boundAxis(child, axis, node.layout[dim[axis]] -
                  getPaddingAndBorderAxis(node, axis) -
                  getMarginAxis(child, axis) -
                  getPosition(child, leading[axis]) -
                  getPosition(child, trailing[axis])),
                // You never want to go smaller than padding
                getPaddingAndBorderAxis(child, axis)
              );
            }
          }
        }

        var/*float*/ nextContentDim = 0;

        // It only makes sense to consider a child flexible if we have a computed
        // dimension for the node.
        if (isMainDimDefined && isFlex(child)) {
          flexibleChildrenCount++;
          totalFlexible += child.style.flex;

          // Store a private linked list of flexible children so that we can
          // efficiently traverse them later.
          if (firstFlexChild === null) {
            firstFlexChild = child;
          }
          if (currentFlexChild !== null) {
            currentFlexChild.nextFlexChild = child;
          }
          currentFlexChild = child;

          // Even if we don't know its exact size yet, we already know the padding,
          // border and margin. We'll use this partial information, which represents
          // the smallest possible size for the child, to compute the remaining
          // available space.
          nextContentDim = getPaddingAndBorderAxis(child, mainAxis) +
            getMarginAxis(child, mainAxis);

        } else {
          maxWidth = CSS_UNDEFINED;
          if (!isMainRowDirection) {
            if (isDimDefined(node, resolvedRowAxis)) {
              maxWidth = node.layout[dim[resolvedRowAxis]] -
                paddingAndBorderAxisResolvedRow;
            } else {
              maxWidth = parentMaxWidth -
                getMarginAxis(node, resolvedRowAxis) -
                paddingAndBorderAxisResolvedRow;
            }
          }

          // This is the main recursive call. We layout non flexible children.
          if (alreadyComputedNextLayout === 0) {
            layoutNode(/*(java)!layoutContext, */child, maxWidth, direction);
          }

          // Absolute positioned elements do not take part of the layout, so we
          // don't use them to compute mainContentDim
          if (getPositionType(child) === CSS_POSITION_RELATIVE) {
            nonFlexibleChildrenCount++;
            // At this point we know the final size and margin of the element.
            nextContentDim = getDimWithMargin(child, mainAxis);
          }
        }

        // The element we are about to add would make us go to the next line
        if (isNodeFlexWrap &&
            isMainDimDefined &&
            mainContentDim + nextContentDim > definedMainDim &&
            // If there's only one element, then it's bigger than the content
            // and needs its own line
            i !== startLine) {
          nonFlexibleChildrenCount--;
          alreadyComputedNextLayout = 1;
          break;
        }

        // Disable simple stacking in the main axis for the current line as
        // we found a non-trivial child. The remaining children will be laid out
        // in <Loop C>.
        if (isSimpleStackMain &&
            (getPositionType(child) !== CSS_POSITION_RELATIVE || isFlex(child))) {
          isSimpleStackMain = false;
          firstComplexMain = i;
        }

        // Disable simple stacking in the cross axis for the current line as
        // we found a non-trivial child. The remaining children will be laid out
        // in <Loop D>.
        if (isSimpleStackCross &&
            (getPositionType(child) !== CSS_POSITION_RELATIVE ||
                (alignItem !== CSS_ALIGN_STRETCH && alignItem !== CSS_ALIGN_FLEX_START) ||
                isUndefined(child.layout[dim[crossAxis]]))) {
          isSimpleStackCross = false;
          firstComplexCross = i;
        }

        if (isSimpleStackMain) {
          child.layout[pos[mainAxis]] += mainDim;
          if (isMainDimDefined) {
            setTrailingPosition(node, child, mainAxis);
          }

          mainDim += getDimWithMargin(child, mainAxis);
          crossDim = fmaxf(crossDim, boundAxis(child, crossAxis, getDimWithMargin(child, crossAxis)));
        }

        if (isSimpleStackCross) {
          child.layout[pos[crossAxis]] += linesCrossDim + leadingPaddingAndBorderCross;
          if (isCrossDimDefined) {
            setTrailingPosition(node, child, crossAxis);
          }
        }

        alreadyComputedNextLayout = 0;
        mainContentDim += nextContentDim;
        endLine = i + 1;
      }

      // <Loop B> Layout flexible children and allocate empty space

      // In order to position the elements in the main axis, we have two
      // controls. The space between the beginning and the first element
      // and the space between each two elements.
      var/*float*/ leadingMainDim = 0;
      var/*float*/ betweenMainDim = 0;

      // The remaining available space that needs to be allocated
      var/*float*/ remainingMainDim = 0;
      if (isMainDimDefined) {
        remainingMainDim = definedMainDim - mainContentDim;
      } else {
        remainingMainDim = fmaxf(mainContentDim, 0) - mainContentDim;
      }

      // If there are flexible children in the mix, they are going to fill the
      // remaining space
      if (flexibleChildrenCount !== 0) {
        var/*float*/ flexibleMainDim = remainingMainDim / totalFlexible;
        var/*float*/ baseMainDim;
        var/*float*/ boundMainDim;

        // If the flex share of remaining space doesn't meet min/max bounds,
        // remove this child from flex calculations.
        currentFlexChild = firstFlexChild;
        while (currentFlexChild !== null) {
          baseMainDim = flexibleMainDim * currentFlexChild.style.flex +
              getPaddingAndBorderAxis(currentFlexChild, mainAxis);
          boundMainDim = boundAxis(currentFlexChild, mainAxis, baseMainDim);

          if (baseMainDim !== boundMainDim) {
            remainingMainDim -= boundMainDim;
            totalFlexible -= currentFlexChild.style.flex;
          }

          currentFlexChild = currentFlexChild.nextFlexChild;
        }
        flexibleMainDim = remainingMainDim / totalFlexible;

        // The non flexible children can overflow the container, in this case
        // we should just assume that there is no space available.
        if (flexibleMainDim < 0) {
          flexibleMainDim = 0;
        }

        currentFlexChild = firstFlexChild;
        while (currentFlexChild !== null) {
          // At this point we know the final size of the element in the main
          // dimension
          currentFlexChild.layout[dim[mainAxis]] = boundAxis(currentFlexChild, mainAxis,
            flexibleMainDim * currentFlexChild.style.flex +
                getPaddingAndBorderAxis(currentFlexChild, mainAxis)
          );

          maxWidth = CSS_UNDEFINED;
          if (isDimDefined(node, resolvedRowAxis)) {
            maxWidth = node.layout[dim[resolvedRowAxis]] -
              paddingAndBorderAxisResolvedRow;
          } else if (!isMainRowDirection) {
            maxWidth = parentMaxWidth -
              getMarginAxis(node, resolvedRowAxis) -
              paddingAndBorderAxisResolvedRow;
          }

          // And we recursively call the layout algorithm for this child
          layoutNode(/*(java)!layoutContext, */currentFlexChild, maxWidth, direction);

          child = currentFlexChild;
          currentFlexChild = currentFlexChild.nextFlexChild;
          child.nextFlexChild = null;
        }

      // We use justifyContent to figure out how to allocate the remaining
      // space available
      } else if (justifyContent !== CSS_JUSTIFY_FLEX_START) {
        if (justifyContent === CSS_JUSTIFY_CENTER) {
          leadingMainDim = remainingMainDim / 2;
        } else if (justifyContent === CSS_JUSTIFY_FLEX_END) {
          leadingMainDim = remainingMainDim;
        } else if (justifyContent === CSS_JUSTIFY_SPACE_BETWEEN) {
          remainingMainDim = fmaxf(remainingMainDim, 0);
          if (flexibleChildrenCount + nonFlexibleChildrenCount - 1 !== 0) {
            betweenMainDim = remainingMainDim /
              (flexibleChildrenCount + nonFlexibleChildrenCount - 1);
          } else {
            betweenMainDim = 0;
          }
        } else if (justifyContent === CSS_JUSTIFY_SPACE_AROUND) {
          // Space on the edges is half of the space between elements
          betweenMainDim = remainingMainDim /
            (flexibleChildrenCount + nonFlexibleChildrenCount);
          leadingMainDim = betweenMainDim / 2;
        }
      }

      // <Loop C> Position elements in the main axis and compute dimensions

      // At this point, all the children have their dimensions set. We need to
      // find their position. In order to do that, we accumulate data in
      // variables that are also useful to compute the total dimensions of the
      // container!
      mainDim += leadingMainDim;

      for (i = firstComplexMain; i < endLine; ++i) {
        child = node.children[i];

        if (getPositionType(child) === CSS_POSITION_ABSOLUTE &&
            isPosDefined(child, leading[mainAxis])) {
          // In case the child is position absolute and has left/top being
          // defined, we override the position to whatever the user said
          // (and margin/border).
          child.layout[pos[mainAxis]] = getPosition(child, leading[mainAxis]) +
            getLeadingBorder(node, mainAxis) +
            getLeadingMargin(child, mainAxis);
        } else {
          // If the child is position absolute (without top/left) or relative,
          // we put it at the current accumulated offset.
          child.layout[pos[mainAxis]] += mainDim;

          // Define the trailing position accordingly.
          if (isMainDimDefined) {
            setTrailingPosition(node, child, mainAxis);
          }

          // Now that we placed the element, we need to update the variables
          // We only need to do that for relative elements. Absolute elements
          // do not take part in that phase.
          if (getPositionType(child) === CSS_POSITION_RELATIVE) {
            // The main dimension is the sum of all the elements dimension plus
            // the spacing.
            mainDim += betweenMainDim + getDimWithMargin(child, mainAxis);
            // The cross dimension is the max of the elements dimension since there
            // can only be one element in that cross dimension.
            crossDim = fmaxf(crossDim, boundAxis(child, crossAxis, getDimWithMargin(child, crossAxis)));
          }
        }
      }

      var/*float*/ containerCrossAxis = node.layout[dim[crossAxis]];
      if (!isCrossDimDefined) {
        containerCrossAxis = fmaxf(
          // For the cross dim, we add both sides at the end because the value
          // is aggregate via a max function. Intermediate negative values
          // can mess this computation otherwise
          boundAxis(node, crossAxis, crossDim + paddingAndBorderAxisCross),
          paddingAndBorderAxisCross
        );
      }

      // <Loop D> Position elements in the cross axis
      for (i = firstComplexCross; i < endLine; ++i) {
        child = node.children[i];

        if (getPositionType(child) === CSS_POSITION_ABSOLUTE &&
            isPosDefined(child, leading[crossAxis])) {
          // In case the child is absolutely positionned and has a
          // top/left/bottom/right being set, we override all the previously
          // computed positions to set it correctly.
          child.layout[pos[crossAxis]] = getPosition(child, leading[crossAxis]) +
            getLeadingBorder(node, crossAxis) +
            getLeadingMargin(child, crossAxis);

        } else {
          var/*float*/ leadingCrossDim = leadingPaddingAndBorderCross;

          // For a relative children, we're either using alignItems (parent) or
          // alignSelf (child) in order to determine the position in the cross axis
          if (getPositionType(child) === CSS_POSITION_RELATIVE) {
            /*eslint-disable */
            // This variable is intentionally re-defined as the code is transpiled to a block scope language
            var/*css_align_t*/ alignItem = getAlignItem(node, child);
            /*eslint-enable */
            if (alignItem === CSS_ALIGN_STRETCH) {
              // You can only stretch if the dimension has not already been set
              // previously.
              if (isUndefined(child.layout[dim[crossAxis]])) {
                child.layout[dim[crossAxis]] = fmaxf(
                  boundAxis(child, crossAxis, containerCrossAxis -
                    paddingAndBorderAxisCross - getMarginAxis(child, crossAxis)),
                  // You never want to go smaller than padding
                  getPaddingAndBorderAxis(child, crossAxis)
                );
              }
            } else if (alignItem !== CSS_ALIGN_FLEX_START) {
              // The remaining space between the parent dimensions+padding and child
              // dimensions+margin.
              var/*float*/ remainingCrossDim = containerCrossAxis -
                paddingAndBorderAxisCross - getDimWithMargin(child, crossAxis);

              if (alignItem === CSS_ALIGN_CENTER) {
                leadingCrossDim += remainingCrossDim / 2;
              } else { // CSS_ALIGN_FLEX_END
                leadingCrossDim += remainingCrossDim;
              }
            }
          }

          // And we apply the position
          child.layout[pos[crossAxis]] += linesCrossDim + leadingCrossDim;

          // Define the trailing position accordingly.
          if (isCrossDimDefined) {
            setTrailingPosition(node, child, crossAxis);
          }
        }
      }

      linesCrossDim += crossDim;
      linesMainDim = fmaxf(linesMainDim, mainDim);
      linesCount += 1;
      startLine = endLine;
    }

    // <Loop E>
    //
    // Note(prenaux): More than one line, we need to layout the crossAxis
    // according to alignContent.
    //
    // Note that we could probably remove <Loop D> and handle the one line case
    // here too, but for the moment this is safer since it won't interfere with
    // previously working code.
    //
    // See specs:
    // http://www.w3.org/TR/2012/CR-css3-flexbox-20120918/#layout-algorithm
    // section 9.4
    //
    if (linesCount > 1 && isCrossDimDefined) {
      var/*float*/ nodeCrossAxisInnerSize = node.layout[dim[crossAxis]] -
          paddingAndBorderAxisCross;
      var/*float*/ remainingAlignContentDim = nodeCrossAxisInnerSize - linesCrossDim;

      var/*float*/ crossDimLead = 0;
      var/*float*/ currentLead = leadingPaddingAndBorderCross;

      var/*css_align_t*/ alignContent = getAlignContent(node);
      if (alignContent === CSS_ALIGN_FLEX_END) {
        currentLead += remainingAlignContentDim;
      } else if (alignContent === CSS_ALIGN_CENTER) {
        currentLead += remainingAlignContentDim / 2;
      } else if (alignContent === CSS_ALIGN_STRETCH) {
        if (nodeCrossAxisInnerSize > linesCrossDim) {
          crossDimLead = (remainingAlignContentDim / linesCount);
        }
      }

      var/*int*/ endIndex = 0;
      for (i = 0; i < linesCount; ++i) {
        var/*int*/ startIndex = endIndex;

        // compute the line's height and find the endIndex
        var/*float*/ lineHeight = 0;
        for (ii = startIndex; ii < childCount; ++ii) {
          child = node.children[ii];
          if (getPositionType(child) !== CSS_POSITION_RELATIVE) {
            continue;
          }
          if (child.lineIndex !== i) {
            break;
          }
          if (!isUndefined(child.layout[dim[crossAxis]])) {
            lineHeight = fmaxf(
              lineHeight,
              child.layout[dim[crossAxis]] + getMarginAxis(child, crossAxis)
            );
          }
        }
        endIndex = ii;
        lineHeight += crossDimLead;

        for (ii = startIndex; ii < endIndex; ++ii) {
          child = node.children[ii];
          if (getPositionType(child) !== CSS_POSITION_RELATIVE) {
            continue;
          }

          var/*css_align_t*/ alignContentAlignItem = getAlignItem(node, child);
          if (alignContentAlignItem === CSS_ALIGN_FLEX_START) {
            child.layout[pos[crossAxis]] = currentLead + getLeadingMargin(child, crossAxis);
          } else if (alignContentAlignItem === CSS_ALIGN_FLEX_END) {
            child.layout[pos[crossAxis]] = currentLead + lineHeight - getTrailingMargin(child, crossAxis) - child.layout[dim[crossAxis]];
          } else if (alignContentAlignItem === CSS_ALIGN_CENTER) {
            var/*float*/ childHeight = child.layout[dim[crossAxis]];
            child.layout[pos[crossAxis]] = currentLead + (lineHeight - childHeight) / 2;
          } else if (alignContentAlignItem === CSS_ALIGN_STRETCH) {
            child.layout[pos[crossAxis]] = currentLead + getLeadingMargin(child, crossAxis);
            // TODO(prenaux): Correctly set the height of items with undefined
            //                (auto) crossAxis dimension.
          }
        }

        currentLead += lineHeight;
      }
    }

    var/*bool*/ needsMainTrailingPos = false;
    var/*bool*/ needsCrossTrailingPos = false;

    // If the user didn't specify a width or height, and it has not been set
    // by the container, then we set it via the children.
    if (!isMainDimDefined) {
      node.layout[dim[mainAxis]] = fmaxf(
        // We're missing the last padding at this point to get the final
        // dimension
        boundAxis(node, mainAxis, linesMainDim + getTrailingPaddingAndBorder(node, mainAxis)),
        // We can never assign a width smaller than the padding and borders
        paddingAndBorderAxisMain
      );

      if (mainAxis === CSS_FLEX_DIRECTION_ROW_REVERSE ||
          mainAxis === CSS_FLEX_DIRECTION_COLUMN_REVERSE) {
        needsMainTrailingPos = true;
      }
    }

    if (!isCrossDimDefined) {
      node.layout[dim[crossAxis]] = fmaxf(
        // For the cross dim, we add both sides at the end because the value
        // is aggregate via a max function. Intermediate negative values
        // can mess this computation otherwise
        boundAxis(node, crossAxis, linesCrossDim + paddingAndBorderAxisCross),
        paddingAndBorderAxisCross
      );

      if (crossAxis === CSS_FLEX_DIRECTION_ROW_REVERSE ||
          crossAxis === CSS_FLEX_DIRECTION_COLUMN_REVERSE) {
        needsCrossTrailingPos = true;
      }
    }

    // <Loop F> Set trailing position if necessary
    if (needsMainTrailingPos || needsCrossTrailingPos) {
      for (i = 0; i < childCount; ++i) {
        child = node.children[i];

        if (needsMainTrailingPos) {
          setTrailingPosition(node, child, mainAxis);
        }

        if (needsCrossTrailingPos) {
          setTrailingPosition(node, child, crossAxis);
        }
      }
    }

    // <Loop G> Calculate dimensions for absolutely positioned elements
    currentAbsoluteChild = firstAbsoluteChild;
    while (currentAbsoluteChild !== null) {
      // Pre-fill dimensions when using absolute position and both offsets for
      // the axis are defined (either both left and right or top and bottom).
      for (ii = 0; ii < 2; ii++) {
        axis = (ii !== 0) ? CSS_FLEX_DIRECTION_ROW : CSS_FLEX_DIRECTION_COLUMN;

        if (!isUndefined(node.layout[dim[axis]]) &&
            !isDimDefined(currentAbsoluteChild, axis) &&
            isPosDefined(currentAbsoluteChild, leading[axis]) &&
            isPosDefined(currentAbsoluteChild, trailing[axis])) {
          currentAbsoluteChild.layout[dim[axis]] = fmaxf(
            boundAxis(currentAbsoluteChild, axis, node.layout[dim[axis]] -
              getBorderAxis(node, axis) -
              getMarginAxis(currentAbsoluteChild, axis) -
              getPosition(currentAbsoluteChild, leading[axis]) -
              getPosition(currentAbsoluteChild, trailing[axis])
            ),
            // You never want to go smaller than padding
            getPaddingAndBorderAxis(currentAbsoluteChild, axis)
          );
        }

        if (isPosDefined(currentAbsoluteChild, trailing[axis]) &&
            !isPosDefined(currentAbsoluteChild, leading[axis])) {
          currentAbsoluteChild.layout[leading[axis]] =
            node.layout[dim[axis]] -
            currentAbsoluteChild.layout[dim[axis]] -
            getPosition(currentAbsoluteChild, trailing[axis]);
        }
      }

      child = currentAbsoluteChild;
      currentAbsoluteChild = currentAbsoluteChild.nextAbsoluteChild;
      child.nextAbsoluteChild = null;
    }
  }

  function layoutNode(node, parentMaxWidth, parentDirection) {
    node.shouldUpdate = true;

    var direction = node.style.direction || CSS_DIRECTION_LTR;
    var skipLayout =
      !node.isDirty &&
      node.lastLayout &&
      node.lastLayout.requestedHeight === node.layout.height &&
      node.lastLayout.requestedWidth === node.layout.width &&
      node.lastLayout.parentMaxWidth === parentMaxWidth &&
      node.lastLayout.direction === direction;

    if (skipLayout) {
      node.layout.width = node.lastLayout.width;
      node.layout.height = node.lastLayout.height;
      node.layout.top = node.lastLayout.top;
      node.layout.left = node.lastLayout.left;
    } else {
      if (!node.lastLayout) {
        node.lastLayout = {};
      }

      node.lastLayout.requestedWidth = node.layout.width;
      node.lastLayout.requestedHeight = node.layout.height;
      node.lastLayout.parentMaxWidth = parentMaxWidth;
      node.lastLayout.direction = direction;

      // Reset child layouts
      node.children.forEach(function(child) {
        child.layout.width = undefined;
        child.layout.height = undefined;
        child.layout.top = 0;
        child.layout.left = 0;
      });

      layoutNodeImpl(node, parentMaxWidth, parentDirection);

      node.lastLayout.width = node.layout.width;
      node.lastLayout.height = node.layout.height;
      node.lastLayout.top = node.layout.top;
      node.lastLayout.left = node.layout.left;
    }
  }

  return {
    layoutNodeImpl: layoutNodeImpl,
    computeLayout: layoutNode,
    fillNodes: fillNodes
  };
})();

// This module export is only used for the purposes of unit testing this file. When
// the library is packaged this file is included within css-layout.js which forms
// the public API.
if (typeof exports === 'object') {
  module.exports = computeLayout;
}


  return function(node) {
    /*eslint-disable */
    // disabling ESLint because this code relies on the above include
    computeLayout.fillNodes(node);
    computeLayout.computeLayout(node);
    /*eslint-enable */
  };
}));

},{}],2:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var Flexer, computeLayout, fn, j, layoutProp, len, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  computeLayout = require("css-layout");

  Flexer = (function(superClass) {
    extend(Flexer, superClass);

    Flexer.layoutProps = ["fixedWidth", "fixedHeight", "minWidth", "minHeight", "maxWidth", "maxHeight", "left", "right", "top", "bottom", "margin", "marginLeft", "marginRight", "marginTop", "marginBottom", "padding", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth", "flexDirection", "justifyContent", "alignItems", "alignSelf", "flex", "flexWrap", "position"];

    Flexer.prototype.curve = void 0;

    function Flexer(layer) {
      var property;
      this.layer = layer;
      this._drawIfNeeded = bind(this._drawIfNeeded, this);
      this._setNeedsUpdate = bind(this._setNeedsUpdate, this);
      this._updateTree = bind(this._updateTree, this);
      this._didResize = bind(this._didResize, this);
      this.layer.on("change:subLayers", this._updateTree);
      Framer.Loop.on("update", this._drawIfNeeded);
      this.layer._context.domEventManager.wrap(window).addEventListener("resize", this._didResize);
      this._layoutNode = {
        style: {},
        children: []
      };
      for (property in Flexer.layoutProps) {
        if (this.layer[property]) {
          this._layoutNode.style[this._getLayoutProperty(property)] = this.layer[property];
        }
      }
    }

    Flexer.prototype._didResize = function() {
      if (!this.layer.superLayer) {
        return this._setNeedsUpdate();
      }
    };

    Flexer.prototype._getLayoutProperty = function(property) {
      var cssLayoutProperty;
      cssLayoutProperty = property;
      if (cssLayoutProperty === "fixedWidth") {
        cssLayoutProperty = "width";
      }
      if (cssLayoutProperty === "fixedHeight") {
        cssLayoutProperty = "height";
      }
      return cssLayoutProperty;
    };

    Flexer.prototype.updateProperty = function(property, value) {
      if (property) {
        this._layoutNode.style[this._getLayoutProperty(property)] = value;
      }
      return this._setNeedsUpdate();
    };

    Flexer.prototype._updateTree = function(layersChanged) {
      var j, k, layerAdded, layerRemoved, len, len1, ref, ref1;
      ref = layersChanged.added;
      for (j = 0, len = ref.length; j < len; j++) {
        layerAdded = ref[j];
        this._layoutNode.children.push(layerAdded.layout._layoutNode);
      }
      ref1 = layersChanged.removed;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        layerRemoved = ref1[k];
        this._layoutNode.children.splice(_layoutNode.indexOf(layerRemoved.layout._layoutNode), 1);
      }
      return this._setNeedsUpdate();
    };

    Flexer.prototype._setNeedsUpdate = function() {
      var rootLayer;
      rootLayer = this.layer;
      while (rootLayer.superLayer) {
        rootLayer = rootLayer.superLayer;
      }
      return rootLayer.layout.needsUpdate = true;
    };

    Flexer.prototype._drawIfNeeded = function() {
      var newTree, rootLayoutNode;
      if (!this.layer.superLayer && this.needsUpdate) {
        this.needsUpdate = false;
        rootLayoutNode = {
          style: {
            width: Screen.width,
            height: Screen.height
          },
          children: [this._layoutNode]
        };
        newTree = Framer._.cloneDeep(rootLayoutNode);
        computeLayout(newTree);
        return this._updateLayer(newTree.children[0]);
      }
    };

    Flexer.prototype._updateLayer = function(computedTree) {
      var frame, i, j, len, ref, results, subLayer;
      if (computedTree.shouldUpdate) {
        if (!this.curve) {
          frame = {
            x: computedTree.layout.left,
            y: computedTree.layout.top,
            width: computedTree.layout.width,
            height: computedTree.layout.height
          };
          this.layer.frame = frame;
        } else {
          this.layer.animate({
            properties: {
              x: computedTree.layout.left,
              y: computedTree.layout.top,
              width: computedTree.layout.width,
              height: computedTree.layout.height
            },
            curve: this.curve
          });
        }
      }
      ref = this.layer.subLayers;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        subLayer = ref[i];
        if (computedTree.children && computedTree.children.length > i) {
          results.push(subLayer.layout._updateLayer(computedTree.children[i]));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return Flexer;

  })(Framer.EventEmitter);

  Layer.define("layout", {
    get: function() {
      if (this._layout == null) {
        this._layout = new Flexer(this);
      }
      return this._layout;
    }
  });

  ref = Flexer.layoutProps;
  fn = (function(_this) {
    return function(layoutProp) {
      return Layer.define(layoutProp, {
        "default": void 0,
        get: function() {
          return this._getPropertyValue(layoutProp);
        },
        set: function(value) {
          this._setPropertyValue(layoutProp, value);
          return this.layout.updateProperty(layoutProp, value);
        }
      });
    };
  })(this);
  for (j = 0, len = ref.length; j < len; j++) {
    layoutProp = ref[j];
    fn(layoutProp);
  }

  module.exports = Flexer;

}).call(this);

},{"css-layout":1}],"npm":[function(require,module,exports){
exports.Flexer = require("flexer");


},{"flexer":2}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9qYXZpL0Rvd25sb2Fkcy9VbnRpdGxlZC5mcmFtZXIvbm9kZV9tb2R1bGVzL2Nzcy1sYXlvdXQvZGlzdC9jc3MtbGF5b3V0LmpzIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvamF2aS9Eb3dubG9hZHMvVW50aXRsZWQuZnJhbWVyL25vZGVfbW9kdWxlcy9mbGV4ZXIvbGliL0ZsZXhlci5qcyIsIi9Vc2Vycy9qYXZpL0Rvd25sb2Fkcy9VbnRpdGxlZC5mcmFtZXIvbW9kdWxlcy9ucG0uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0EsT0FBTyxDQUFDLE1BQVIsR0FBaUIsT0FBQSxDQUFRLFFBQVIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gVU1EIChVbml2ZXJzYWwgTW9kdWxlIERlZmluaXRpb24pXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZCBmb3IgcmVmZXJlbmNlXG4vL1xuLy8gVGhpcyBmaWxlIHVzZXMgdGhlIGZvbGxvd2luZyBzcGVjaWZpYyBVTUQgaW1wbGVtZW50YXRpb246XG4vLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAvLyBsaWtlIE5vZGUuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICByb290LmNvbXB1dGVMYXlvdXQgPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24oKSB7XG4gIC8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxudmFyIGNvbXB1dGVMYXlvdXQgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIENTU19VTkRFRklORUQ7XG5cbiAgdmFyIENTU19ESVJFQ1RJT05fSU5IRVJJVCA9ICdpbmhlcml0JztcbiAgdmFyIENTU19ESVJFQ1RJT05fTFRSID0gJ2x0cic7XG4gIHZhciBDU1NfRElSRUNUSU9OX1JUTCA9ICdydGwnO1xuXG4gIHZhciBDU1NfRkxFWF9ESVJFQ1RJT05fUk9XID0gJ3Jvdyc7XG4gIHZhciBDU1NfRkxFWF9ESVJFQ1RJT05fUk9XX1JFVkVSU0UgPSAncm93LXJldmVyc2UnO1xuICB2YXIgQ1NTX0ZMRVhfRElSRUNUSU9OX0NPTFVNTiA9ICdjb2x1bW4nO1xuICB2YXIgQ1NTX0ZMRVhfRElSRUNUSU9OX0NPTFVNTl9SRVZFUlNFID0gJ2NvbHVtbi1yZXZlcnNlJztcblxuICB2YXIgQ1NTX0pVU1RJRllfRkxFWF9TVEFSVCA9ICdmbGV4LXN0YXJ0JztcbiAgdmFyIENTU19KVVNUSUZZX0NFTlRFUiA9ICdjZW50ZXInO1xuICB2YXIgQ1NTX0pVU1RJRllfRkxFWF9FTkQgPSAnZmxleC1lbmQnO1xuICB2YXIgQ1NTX0pVU1RJRllfU1BBQ0VfQkVUV0VFTiA9ICdzcGFjZS1iZXR3ZWVuJztcbiAgdmFyIENTU19KVVNUSUZZX1NQQUNFX0FST1VORCA9ICdzcGFjZS1hcm91bmQnO1xuXG4gIHZhciBDU1NfQUxJR05fRkxFWF9TVEFSVCA9ICdmbGV4LXN0YXJ0JztcbiAgdmFyIENTU19BTElHTl9DRU5URVIgPSAnY2VudGVyJztcbiAgdmFyIENTU19BTElHTl9GTEVYX0VORCA9ICdmbGV4LWVuZCc7XG4gIHZhciBDU1NfQUxJR05fU1RSRVRDSCA9ICdzdHJldGNoJztcblxuICB2YXIgQ1NTX1BPU0lUSU9OX1JFTEFUSVZFID0gJ3JlbGF0aXZlJztcbiAgdmFyIENTU19QT1NJVElPTl9BQlNPTFVURSA9ICdhYnNvbHV0ZSc7XG5cbiAgdmFyIGxlYWRpbmcgPSB7XG4gICAgJ3Jvdyc6ICdsZWZ0JyxcbiAgICAncm93LXJldmVyc2UnOiAncmlnaHQnLFxuICAgICdjb2x1bW4nOiAndG9wJyxcbiAgICAnY29sdW1uLXJldmVyc2UnOiAnYm90dG9tJ1xuICB9O1xuICB2YXIgdHJhaWxpbmcgPSB7XG4gICAgJ3Jvdyc6ICdyaWdodCcsXG4gICAgJ3Jvdy1yZXZlcnNlJzogJ2xlZnQnLFxuICAgICdjb2x1bW4nOiAnYm90dG9tJyxcbiAgICAnY29sdW1uLXJldmVyc2UnOiAndG9wJ1xuICB9O1xuICB2YXIgcG9zID0ge1xuICAgICdyb3cnOiAnbGVmdCcsXG4gICAgJ3Jvdy1yZXZlcnNlJzogJ3JpZ2h0JyxcbiAgICAnY29sdW1uJzogJ3RvcCcsXG4gICAgJ2NvbHVtbi1yZXZlcnNlJzogJ2JvdHRvbSdcbiAgfTtcbiAgdmFyIGRpbSA9IHtcbiAgICAncm93JzogJ3dpZHRoJyxcbiAgICAncm93LXJldmVyc2UnOiAnd2lkdGgnLFxuICAgICdjb2x1bW4nOiAnaGVpZ2h0JyxcbiAgICAnY29sdW1uLXJldmVyc2UnOiAnaGVpZ2h0J1xuICB9O1xuXG4gIC8vIFdoZW4gdHJhbnNwaWxlZCB0byBKYXZhIC8gQyB0aGUgbm9kZSB0eXBlIGhhcyBsYXlvdXQsIGNoaWxkcmVuIGFuZCBzdHlsZVxuICAvLyBwcm9wZXJ0aWVzLiBGb3IgdGhlIEphdmFTY3JpcHQgdmVyc2lvbiB0aGlzIGZ1bmN0aW9uIGFkZHMgdGhlc2UgcHJvcGVydGllc1xuICAvLyBpZiB0aGV5IGRvbid0IGFscmVhZHkgZXhpc3QuXG4gIGZ1bmN0aW9uIGZpbGxOb2Rlcyhub2RlKSB7XG4gICAgaWYgKCFub2RlLmxheW91dCB8fCBub2RlLmlzRGlydHkpIHtcbiAgICAgIG5vZGUubGF5b3V0ID0ge1xuICAgICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgICBoZWlnaHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgYm90dG9tOiAwXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICghbm9kZS5zdHlsZSkge1xuICAgICAgbm9kZS5zdHlsZSA9IHt9O1xuICAgIH1cblxuICAgIGlmICghbm9kZS5jaGlsZHJlbikge1xuICAgICAgbm9kZS5jaGlsZHJlbiA9IFtdO1xuICAgIH1cbiAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goZmlsbE5vZGVzKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBpc1Jvd0RpcmVjdGlvbihmbGV4RGlyZWN0aW9uKSB7XG4gICAgcmV0dXJuIGZsZXhEaXJlY3Rpb24gPT09IENTU19GTEVYX0RJUkVDVElPTl9ST1cgfHxcbiAgICAgICAgICAgZmxleERpcmVjdGlvbiA9PT0gQ1NTX0ZMRVhfRElSRUNUSU9OX1JPV19SRVZFUlNFO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNDb2x1bW5EaXJlY3Rpb24oZmxleERpcmVjdGlvbikge1xuICAgIHJldHVybiBmbGV4RGlyZWN0aW9uID09PSBDU1NfRkxFWF9ESVJFQ1RJT05fQ09MVU1OIHx8XG4gICAgICAgICAgIGZsZXhEaXJlY3Rpb24gPT09IENTU19GTEVYX0RJUkVDVElPTl9DT0xVTU5fUkVWRVJTRTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExlYWRpbmdNYXJnaW4obm9kZSwgYXhpcykge1xuICAgIGlmIChub2RlLnN0eWxlLm1hcmdpblN0YXJ0ICE9PSB1bmRlZmluZWQgJiYgaXNSb3dEaXJlY3Rpb24oYXhpcykpIHtcbiAgICAgIHJldHVybiBub2RlLnN0eWxlLm1hcmdpblN0YXJ0O1xuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IG51bGw7XG4gICAgc3dpdGNoIChheGlzKSB7XG4gICAgICBjYXNlICdyb3cnOiAgICAgICAgICAgIHZhbHVlID0gbm9kZS5zdHlsZS5tYXJnaW5MZWZ0OyAgIGJyZWFrO1xuICAgICAgY2FzZSAncm93LXJldmVyc2UnOiAgICB2YWx1ZSA9IG5vZGUuc3R5bGUubWFyZ2luUmlnaHQ7ICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbHVtbic6ICAgICAgICAgdmFsdWUgPSBub2RlLnN0eWxlLm1hcmdpblRvcDsgICAgYnJlYWs7XG4gICAgICBjYXNlICdjb2x1bW4tcmV2ZXJzZSc6IHZhbHVlID0gbm9kZS5zdHlsZS5tYXJnaW5Cb3R0b207IGJyZWFrO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUuc3R5bGUubWFyZ2luICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBub2RlLnN0eWxlLm1hcmdpbjtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRyYWlsaW5nTWFyZ2luKG5vZGUsIGF4aXMpIHtcbiAgICBpZiAobm9kZS5zdHlsZS5tYXJnaW5FbmQgIT09IHVuZGVmaW5lZCAmJiBpc1Jvd0RpcmVjdGlvbihheGlzKSkge1xuICAgICAgcmV0dXJuIG5vZGUuc3R5bGUubWFyZ2luRW5kO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IG51bGw7XG4gICAgc3dpdGNoIChheGlzKSB7XG4gICAgICBjYXNlICdyb3cnOiAgICAgICAgICAgIHZhbHVlID0gbm9kZS5zdHlsZS5tYXJnaW5SaWdodDsgIGJyZWFrO1xuICAgICAgY2FzZSAncm93LXJldmVyc2UnOiAgICB2YWx1ZSA9IG5vZGUuc3R5bGUubWFyZ2luTGVmdDsgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbHVtbic6ICAgICAgICAgdmFsdWUgPSBub2RlLnN0eWxlLm1hcmdpbkJvdHRvbTsgYnJlYWs7XG4gICAgICBjYXNlICdjb2x1bW4tcmV2ZXJzZSc6IHZhbHVlID0gbm9kZS5zdHlsZS5tYXJnaW5Ub3A7ICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUuc3R5bGUubWFyZ2luICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBub2RlLnN0eWxlLm1hcmdpbjtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExlYWRpbmdQYWRkaW5nKG5vZGUsIGF4aXMpIHtcbiAgICBpZiAobm9kZS5zdHlsZS5wYWRkaW5nU3RhcnQgIT09IHVuZGVmaW5lZCAmJiBub2RlLnN0eWxlLnBhZGRpbmdTdGFydCA+PSAwXG4gICAgICAgICYmIGlzUm93RGlyZWN0aW9uKGF4aXMpKSB7XG4gICAgICByZXR1cm4gbm9kZS5zdHlsZS5wYWRkaW5nU3RhcnQ7XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gbnVsbDtcbiAgICBzd2l0Y2ggKGF4aXMpIHtcbiAgICAgIGNhc2UgJ3Jvdyc6ICAgICAgICAgICAgdmFsdWUgPSBub2RlLnN0eWxlLnBhZGRpbmdMZWZ0OyAgIGJyZWFrO1xuICAgICAgY2FzZSAncm93LXJldmVyc2UnOiAgICB2YWx1ZSA9IG5vZGUuc3R5bGUucGFkZGluZ1JpZ2h0OyAgYnJlYWs7XG4gICAgICBjYXNlICdjb2x1bW4nOiAgICAgICAgIHZhbHVlID0gbm9kZS5zdHlsZS5wYWRkaW5nVG9wOyAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbHVtbi1yZXZlcnNlJzogdmFsdWUgPSBub2RlLnN0eWxlLnBhZGRpbmdCb3R0b207IGJyZWFrO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlID49IDApIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAobm9kZS5zdHlsZS5wYWRkaW5nICE9PSB1bmRlZmluZWQgJiYgbm9kZS5zdHlsZS5wYWRkaW5nID49IDApIHtcbiAgICAgIHJldHVybiBub2RlLnN0eWxlLnBhZGRpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUcmFpbGluZ1BhZGRpbmcobm9kZSwgYXhpcykge1xuICAgIGlmIChub2RlLnN0eWxlLnBhZGRpbmdFbmQgIT09IHVuZGVmaW5lZCAmJiBub2RlLnN0eWxlLnBhZGRpbmdFbmQgPj0gMFxuICAgICAgICAmJiBpc1Jvd0RpcmVjdGlvbihheGlzKSkge1xuICAgICAgcmV0dXJuIG5vZGUuc3R5bGUucGFkZGluZ0VuZDtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSBudWxsO1xuICAgIHN3aXRjaCAoYXhpcykge1xuICAgICAgY2FzZSAncm93JzogICAgICAgICAgICB2YWx1ZSA9IG5vZGUuc3R5bGUucGFkZGluZ1JpZ2h0OyAgYnJlYWs7XG4gICAgICBjYXNlICdyb3ctcmV2ZXJzZSc6ICAgIHZhbHVlID0gbm9kZS5zdHlsZS5wYWRkaW5nTGVmdDsgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbHVtbic6ICAgICAgICAgdmFsdWUgPSBub2RlLnN0eWxlLnBhZGRpbmdCb3R0b207IGJyZWFrO1xuICAgICAgY2FzZSAnY29sdW1uLXJldmVyc2UnOiB2YWx1ZSA9IG5vZGUuc3R5bGUucGFkZGluZ1RvcDsgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlICE9IG51bGwgJiYgdmFsdWUgPj0gMCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIGlmIChub2RlLnN0eWxlLnBhZGRpbmcgIT09IHVuZGVmaW5lZCAmJiBub2RlLnN0eWxlLnBhZGRpbmcgPj0gMCkge1xuICAgICAgcmV0dXJuIG5vZGUuc3R5bGUucGFkZGluZztcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExlYWRpbmdCb3JkZXIobm9kZSwgYXhpcykge1xuICAgIGlmIChub2RlLnN0eWxlLmJvcmRlclN0YXJ0V2lkdGggIT09IHVuZGVmaW5lZCAmJiBub2RlLnN0eWxlLmJvcmRlclN0YXJ0V2lkdGggPj0gMFxuICAgICAgICAmJiBpc1Jvd0RpcmVjdGlvbihheGlzKSkge1xuICAgICAgcmV0dXJuIG5vZGUuc3R5bGUuYm9yZGVyU3RhcnRXaWR0aDtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSBudWxsO1xuICAgIHN3aXRjaCAoYXhpcykge1xuICAgICAgY2FzZSAncm93JzogICAgICAgICAgICB2YWx1ZSA9IG5vZGUuc3R5bGUuYm9yZGVyTGVmdFdpZHRoOyAgIGJyZWFrO1xuICAgICAgY2FzZSAncm93LXJldmVyc2UnOiAgICB2YWx1ZSA9IG5vZGUuc3R5bGUuYm9yZGVyUmlnaHRXaWR0aDsgIGJyZWFrO1xuICAgICAgY2FzZSAnY29sdW1uJzogICAgICAgICB2YWx1ZSA9IG5vZGUuc3R5bGUuYm9yZGVyVG9wV2lkdGg7ICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY29sdW1uLXJldmVyc2UnOiB2YWx1ZSA9IG5vZGUuc3R5bGUuYm9yZGVyQm90dG9tV2lkdGg7IGJyZWFrO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlID49IDApIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAobm9kZS5zdHlsZS5ib3JkZXJXaWR0aCAhPT0gdW5kZWZpbmVkICYmIG5vZGUuc3R5bGUuYm9yZGVyV2lkdGggPj0gMCkge1xuICAgICAgcmV0dXJuIG5vZGUuc3R5bGUuYm9yZGVyV2lkdGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUcmFpbGluZ0JvcmRlcihub2RlLCBheGlzKSB7XG4gICAgaWYgKG5vZGUuc3R5bGUuYm9yZGVyRW5kV2lkdGggIT09IHVuZGVmaW5lZCAmJiBub2RlLnN0eWxlLmJvcmRlckVuZFdpZHRoID49IDBcbiAgICAgICAgJiYgaXNSb3dEaXJlY3Rpb24oYXhpcykpIHtcbiAgICAgIHJldHVybiBub2RlLnN0eWxlLmJvcmRlckVuZFdpZHRoO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IG51bGw7XG4gICAgc3dpdGNoIChheGlzKSB7XG4gICAgICBjYXNlICdyb3cnOiAgICAgICAgICAgIHZhbHVlID0gbm9kZS5zdHlsZS5ib3JkZXJSaWdodFdpZHRoOyAgYnJlYWs7XG4gICAgICBjYXNlICdyb3ctcmV2ZXJzZSc6ICAgIHZhbHVlID0gbm9kZS5zdHlsZS5ib3JkZXJMZWZ0V2lkdGg7ICAgYnJlYWs7XG4gICAgICBjYXNlICdjb2x1bW4nOiAgICAgICAgIHZhbHVlID0gbm9kZS5zdHlsZS5ib3JkZXJCb3R0b21XaWR0aDsgYnJlYWs7XG4gICAgICBjYXNlICdjb2x1bW4tcmV2ZXJzZSc6IHZhbHVlID0gbm9kZS5zdHlsZS5ib3JkZXJUb3BXaWR0aDsgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlICE9IG51bGwgJiYgdmFsdWUgPj0gMCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIGlmIChub2RlLnN0eWxlLmJvcmRlcldpZHRoICE9PSB1bmRlZmluZWQgJiYgbm9kZS5zdHlsZS5ib3JkZXJXaWR0aCA+PSAwKSB7XG4gICAgICByZXR1cm4gbm9kZS5zdHlsZS5ib3JkZXJXaWR0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExlYWRpbmdQYWRkaW5nQW5kQm9yZGVyKG5vZGUsIGF4aXMpIHtcbiAgICByZXR1cm4gZ2V0TGVhZGluZ1BhZGRpbmcobm9kZSwgYXhpcykgKyBnZXRMZWFkaW5nQm9yZGVyKG5vZGUsIGF4aXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VHJhaWxpbmdQYWRkaW5nQW5kQm9yZGVyKG5vZGUsIGF4aXMpIHtcbiAgICByZXR1cm4gZ2V0VHJhaWxpbmdQYWRkaW5nKG5vZGUsIGF4aXMpICsgZ2V0VHJhaWxpbmdCb3JkZXIobm9kZSwgYXhpcyk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRCb3JkZXJBeGlzKG5vZGUsIGF4aXMpIHtcbiAgICByZXR1cm4gZ2V0TGVhZGluZ0JvcmRlcihub2RlLCBheGlzKSArIGdldFRyYWlsaW5nQm9yZGVyKG5vZGUsIGF4aXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWFyZ2luQXhpcyhub2RlLCBheGlzKSB7XG4gICAgcmV0dXJuIGdldExlYWRpbmdNYXJnaW4obm9kZSwgYXhpcykgKyBnZXRUcmFpbGluZ01hcmdpbihub2RlLCBheGlzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBhZGRpbmdBbmRCb3JkZXJBeGlzKG5vZGUsIGF4aXMpIHtcbiAgICByZXR1cm4gZ2V0TGVhZGluZ1BhZGRpbmdBbmRCb3JkZXIobm9kZSwgYXhpcykgK1xuICAgICAgICBnZXRUcmFpbGluZ1BhZGRpbmdBbmRCb3JkZXIobm9kZSwgYXhpcyk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRKdXN0aWZ5Q29udGVudChub2RlKSB7XG4gICAgaWYgKG5vZGUuc3R5bGUuanVzdGlmeUNvbnRlbnQpIHtcbiAgICAgIHJldHVybiBub2RlLnN0eWxlLmp1c3RpZnlDb250ZW50O1xuICAgIH1cbiAgICByZXR1cm4gJ2ZsZXgtc3RhcnQnO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0QWxpZ25Db250ZW50KG5vZGUpIHtcbiAgICBpZiAobm9kZS5zdHlsZS5hbGlnbkNvbnRlbnQpIHtcbiAgICAgIHJldHVybiBub2RlLnN0eWxlLmFsaWduQ29udGVudDtcbiAgICB9XG4gICAgcmV0dXJuICdmbGV4LXN0YXJ0JztcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEFsaWduSXRlbShub2RlLCBjaGlsZCkge1xuICAgIGlmIChjaGlsZC5zdHlsZS5hbGlnblNlbGYpIHtcbiAgICAgIHJldHVybiBjaGlsZC5zdHlsZS5hbGlnblNlbGY7XG4gICAgfVxuICAgIGlmIChub2RlLnN0eWxlLmFsaWduSXRlbXMpIHtcbiAgICAgIHJldHVybiBub2RlLnN0eWxlLmFsaWduSXRlbXM7XG4gICAgfVxuICAgIHJldHVybiAnc3RyZXRjaCc7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlQXhpcyhheGlzLCBkaXJlY3Rpb24pIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBDU1NfRElSRUNUSU9OX1JUTCkge1xuICAgICAgaWYgKGF4aXMgPT09IENTU19GTEVYX0RJUkVDVElPTl9ST1cpIHtcbiAgICAgICAgcmV0dXJuIENTU19GTEVYX0RJUkVDVElPTl9ST1dfUkVWRVJTRTtcbiAgICAgIH0gZWxzZSBpZiAoYXhpcyA9PT0gQ1NTX0ZMRVhfRElSRUNUSU9OX1JPV19SRVZFUlNFKSB7XG4gICAgICAgIHJldHVybiBDU1NfRkxFWF9ESVJFQ1RJT05fUk9XO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBheGlzO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZURpcmVjdGlvbihub2RlLCBwYXJlbnREaXJlY3Rpb24pIHtcbiAgICB2YXIgZGlyZWN0aW9uO1xuICAgIGlmIChub2RlLnN0eWxlLmRpcmVjdGlvbikge1xuICAgICAgZGlyZWN0aW9uID0gbm9kZS5zdHlsZS5kaXJlY3Rpb247XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpcmVjdGlvbiA9IENTU19ESVJFQ1RJT05fSU5IRVJJVDtcbiAgICB9XG5cbiAgICBpZiAoZGlyZWN0aW9uID09PSBDU1NfRElSRUNUSU9OX0lOSEVSSVQpIHtcbiAgICAgIGRpcmVjdGlvbiA9IChwYXJlbnREaXJlY3Rpb24gPT09IHVuZGVmaW5lZCA/IENTU19ESVJFQ1RJT05fTFRSIDogcGFyZW50RGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGlyZWN0aW9uO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0RmxleERpcmVjdGlvbihub2RlKSB7XG4gICAgaWYgKG5vZGUuc3R5bGUuZmxleERpcmVjdGlvbikge1xuICAgICAgcmV0dXJuIG5vZGUuc3R5bGUuZmxleERpcmVjdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIENTU19GTEVYX0RJUkVDVElPTl9DT0xVTU47XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDcm9zc0ZsZXhEaXJlY3Rpb24oZmxleERpcmVjdGlvbiwgZGlyZWN0aW9uKSB7XG4gICAgaWYgKGlzQ29sdW1uRGlyZWN0aW9uKGZsZXhEaXJlY3Rpb24pKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZUF4aXMoQ1NTX0ZMRVhfRElSRUNUSU9OX1JPVywgZGlyZWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIENTU19GTEVYX0RJUkVDVElPTl9DT0xVTU47XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UG9zaXRpb25UeXBlKG5vZGUpIHtcbiAgICBpZiAobm9kZS5zdHlsZS5wb3NpdGlvbikge1xuICAgICAgcmV0dXJuIG5vZGUuc3R5bGUucG9zaXRpb247XG4gICAgfVxuICAgIHJldHVybiAncmVsYXRpdmUnO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNGbGV4KG5vZGUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgZ2V0UG9zaXRpb25UeXBlKG5vZGUpID09PSBDU1NfUE9TSVRJT05fUkVMQVRJVkUgJiZcbiAgICAgIG5vZGUuc3R5bGUuZmxleCA+IDBcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNGbGV4V3JhcChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUuc3R5bGUuZmxleFdyYXAgPT09ICd3cmFwJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldERpbVdpdGhNYXJnaW4obm9kZSwgYXhpcykge1xuICAgIHJldHVybiBub2RlLmxheW91dFtkaW1bYXhpc11dICsgZ2V0TWFyZ2luQXhpcyhub2RlLCBheGlzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRGltRGVmaW5lZChub2RlLCBheGlzKSB7XG4gICAgcmV0dXJuIG5vZGUuc3R5bGVbZGltW2F4aXNdXSAhPT0gdW5kZWZpbmVkICYmIG5vZGUuc3R5bGVbZGltW2F4aXNdXSA+PSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNQb3NEZWZpbmVkKG5vZGUsIHBvcykge1xuICAgIHJldHVybiBub2RlLnN0eWxlW3Bvc10gIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTWVhc3VyZURlZmluZWQobm9kZSkge1xuICAgIHJldHVybiBub2RlLnN0eWxlLm1lYXN1cmUgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBvc2l0aW9uKG5vZGUsIHBvcykge1xuICAgIGlmIChub2RlLnN0eWxlW3Bvc10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5vZGUuc3R5bGVbcG9zXTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBmdW5jdGlvbiBib3VuZEF4aXMobm9kZSwgYXhpcywgdmFsdWUpIHtcbiAgICB2YXIgbWluID0ge1xuICAgICAgJ3Jvdyc6IG5vZGUuc3R5bGUubWluV2lkdGgsXG4gICAgICAncm93LXJldmVyc2UnOiBub2RlLnN0eWxlLm1pbldpZHRoLFxuICAgICAgJ2NvbHVtbic6IG5vZGUuc3R5bGUubWluSGVpZ2h0LFxuICAgICAgJ2NvbHVtbi1yZXZlcnNlJzogbm9kZS5zdHlsZS5taW5IZWlnaHRcbiAgICB9W2F4aXNdO1xuXG4gICAgdmFyIG1heCA9IHtcbiAgICAgICdyb3cnOiBub2RlLnN0eWxlLm1heFdpZHRoLFxuICAgICAgJ3Jvdy1yZXZlcnNlJzogbm9kZS5zdHlsZS5tYXhXaWR0aCxcbiAgICAgICdjb2x1bW4nOiBub2RlLnN0eWxlLm1heEhlaWdodCxcbiAgICAgICdjb2x1bW4tcmV2ZXJzZSc6IG5vZGUuc3R5bGUubWF4SGVpZ2h0XG4gICAgfVtheGlzXTtcblxuICAgIHZhciBib3VuZFZhbHVlID0gdmFsdWU7XG4gICAgaWYgKG1heCAhPT0gdW5kZWZpbmVkICYmIG1heCA+PSAwICYmIGJvdW5kVmFsdWUgPiBtYXgpIHtcbiAgICAgIGJvdW5kVmFsdWUgPSBtYXg7XG4gICAgfVxuICAgIGlmIChtaW4gIT09IHVuZGVmaW5lZCAmJiBtaW4gPj0gMCAmJiBib3VuZFZhbHVlIDwgbWluKSB7XG4gICAgICBib3VuZFZhbHVlID0gbWluO1xuICAgIH1cbiAgICByZXR1cm4gYm91bmRWYWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZtYXhmKGEsIGIpIHtcbiAgICBpZiAoYSA+IGIpIHtcbiAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgICByZXR1cm4gYjtcbiAgfVxuXG4gIC8vIFdoZW4gdGhlIHVzZXIgc3BlY2lmaWNhbGx5IHNldHMgYSB2YWx1ZSBmb3Igd2lkdGggb3IgaGVpZ2h0XG4gIGZ1bmN0aW9uIHNldERpbWVuc2lvbkZyb21TdHlsZShub2RlLCBheGlzKSB7XG4gICAgLy8gVGhlIHBhcmVudCBhbHJlYWR5IGNvbXB1dGVkIHVzIGEgd2lkdGggb3IgaGVpZ2h0LiBXZSBqdXN0IHNraXAgaXRcbiAgICBpZiAobm9kZS5sYXlvdXRbZGltW2F4aXNdXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFdlIG9ubHkgcnVuIGlmIHRoZXJlJ3MgYSB3aWR0aCBvciBoZWlnaHQgZGVmaW5lZFxuICAgIGlmICghaXNEaW1EZWZpbmVkKG5vZGUsIGF4aXMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIGRpbWVuc2lvbnMgY2FuIG5ldmVyIGJlIHNtYWxsZXIgdGhhbiB0aGUgcGFkZGluZyBhbmQgYm9yZGVyXG4gICAgbm9kZS5sYXlvdXRbZGltW2F4aXNdXSA9IGZtYXhmKFxuICAgICAgYm91bmRBeGlzKG5vZGUsIGF4aXMsIG5vZGUuc3R5bGVbZGltW2F4aXNdXSksXG4gICAgICBnZXRQYWRkaW5nQW5kQm9yZGVyQXhpcyhub2RlLCBheGlzKVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRUcmFpbGluZ1Bvc2l0aW9uKG5vZGUsIGNoaWxkLCBheGlzKSB7XG4gICAgY2hpbGQubGF5b3V0W3RyYWlsaW5nW2F4aXNdXSA9IG5vZGUubGF5b3V0W2RpbVtheGlzXV0gLVxuICAgICAgICBjaGlsZC5sYXlvdXRbZGltW2F4aXNdXSAtIGNoaWxkLmxheW91dFtwb3NbYXhpc11dO1xuICB9XG5cbiAgLy8gSWYgYm90aCBsZWZ0IGFuZCByaWdodCBhcmUgZGVmaW5lZCwgdGhlbiB1c2UgbGVmdC4gT3RoZXJ3aXNlIHJldHVyblxuICAvLyArbGVmdCBvciAtcmlnaHQgZGVwZW5kaW5nIG9uIHdoaWNoIGlzIGRlZmluZWQuXG4gIGZ1bmN0aW9uIGdldFJlbGF0aXZlUG9zaXRpb24obm9kZSwgYXhpcykge1xuICAgIGlmIChub2RlLnN0eWxlW2xlYWRpbmdbYXhpc11dICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbihub2RlLCBsZWFkaW5nW2F4aXNdKTtcbiAgICB9XG4gICAgcmV0dXJuIC1nZXRQb3NpdGlvbihub2RlLCB0cmFpbGluZ1theGlzXSk7XG4gIH1cblxuICBmdW5jdGlvbiBsYXlvdXROb2RlSW1wbChub2RlLCBwYXJlbnRNYXhXaWR0aCwgLypjc3NfZGlyZWN0aW9uX3QqL3BhcmVudERpcmVjdGlvbikge1xuICAgIHZhci8qY3NzX2RpcmVjdGlvbl90Ki8gZGlyZWN0aW9uID0gcmVzb2x2ZURpcmVjdGlvbihub2RlLCBwYXJlbnREaXJlY3Rpb24pO1xuICAgIHZhci8qKGMpIWNzc19mbGV4X2RpcmVjdGlvbl90Ki8vKihqYXZhKSFpbnQqLyBtYWluQXhpcyA9IHJlc29sdmVBeGlzKGdldEZsZXhEaXJlY3Rpb24obm9kZSksIGRpcmVjdGlvbik7XG4gICAgdmFyLyooYykhY3NzX2ZsZXhfZGlyZWN0aW9uX3QqLy8qKGphdmEpIWludCovIGNyb3NzQXhpcyA9IGdldENyb3NzRmxleERpcmVjdGlvbihtYWluQXhpcywgZGlyZWN0aW9uKTtcbiAgICB2YXIvKihjKSFjc3NfZmxleF9kaXJlY3Rpb25fdCovLyooamF2YSkhaW50Ki8gcmVzb2x2ZWRSb3dBeGlzID0gcmVzb2x2ZUF4aXMoQ1NTX0ZMRVhfRElSRUNUSU9OX1JPVywgZGlyZWN0aW9uKTtcblxuICAgIC8vIEhhbmRsZSB3aWR0aCBhbmQgaGVpZ2h0IHN0eWxlIGF0dHJpYnV0ZXNcbiAgICBzZXREaW1lbnNpb25Gcm9tU3R5bGUobm9kZSwgbWFpbkF4aXMpO1xuICAgIHNldERpbWVuc2lvbkZyb21TdHlsZShub2RlLCBjcm9zc0F4aXMpO1xuXG4gICAgLy8gU2V0IHRoZSByZXNvbHZlZCByZXNvbHV0aW9uIGluIHRoZSBub2RlJ3MgbGF5b3V0XG4gICAgbm9kZS5sYXlvdXQuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuXG4gICAgLy8gVGhlIHBvc2l0aW9uIGlzIHNldCBieSB0aGUgcGFyZW50LCBidXQgd2UgbmVlZCB0byBjb21wbGV0ZSBpdCB3aXRoIGFcbiAgICAvLyBkZWx0YSBjb21wb3NlZCBvZiB0aGUgbWFyZ2luIGFuZCBsZWZ0L3RvcC9yaWdodC9ib3R0b21cbiAgICBub2RlLmxheW91dFtsZWFkaW5nW21haW5BeGlzXV0gKz0gZ2V0TGVhZGluZ01hcmdpbihub2RlLCBtYWluQXhpcykgK1xuICAgICAgZ2V0UmVsYXRpdmVQb3NpdGlvbihub2RlLCBtYWluQXhpcyk7XG4gICAgbm9kZS5sYXlvdXRbdHJhaWxpbmdbbWFpbkF4aXNdXSArPSBnZXRUcmFpbGluZ01hcmdpbihub2RlLCBtYWluQXhpcykgK1xuICAgICAgZ2V0UmVsYXRpdmVQb3NpdGlvbihub2RlLCBtYWluQXhpcyk7XG4gICAgbm9kZS5sYXlvdXRbbGVhZGluZ1tjcm9zc0F4aXNdXSArPSBnZXRMZWFkaW5nTWFyZ2luKG5vZGUsIGNyb3NzQXhpcykgK1xuICAgICAgZ2V0UmVsYXRpdmVQb3NpdGlvbihub2RlLCBjcm9zc0F4aXMpO1xuICAgIG5vZGUubGF5b3V0W3RyYWlsaW5nW2Nyb3NzQXhpc11dICs9IGdldFRyYWlsaW5nTWFyZ2luKG5vZGUsIGNyb3NzQXhpcykgK1xuICAgICAgZ2V0UmVsYXRpdmVQb3NpdGlvbihub2RlLCBjcm9zc0F4aXMpO1xuXG4gICAgLy8gSW5saW5lIGltbXV0YWJsZSB2YWx1ZXMgZnJvbSB0aGUgdGFyZ2V0IG5vZGUgdG8gYXZvaWQgZXhjZXNzaXZlIG1ldGhvZFxuICAgIC8vIGludm9jYXRpb25zIGR1cmluZyB0aGUgbGF5b3V0IGNhbGN1bGF0aW9uLlxuICAgIHZhci8qaW50Ki8gY2hpbGRDb3VudCA9IG5vZGUuY2hpbGRyZW4ubGVuZ3RoO1xuICAgIHZhci8qZmxvYXQqLyBwYWRkaW5nQW5kQm9yZGVyQXhpc1Jlc29sdmVkUm93ID0gZ2V0UGFkZGluZ0FuZEJvcmRlckF4aXMobm9kZSwgcmVzb2x2ZWRSb3dBeGlzKTtcblxuICAgIGlmIChpc01lYXN1cmVEZWZpbmVkKG5vZGUpKSB7XG4gICAgICB2YXIvKmJvb2wqLyBpc1Jlc29sdmVkUm93RGltRGVmaW5lZCA9ICFpc1VuZGVmaW5lZChub2RlLmxheW91dFtkaW1bcmVzb2x2ZWRSb3dBeGlzXV0pO1xuXG4gICAgICB2YXIvKmZsb2F0Ki8gd2lkdGggPSBDU1NfVU5ERUZJTkVEO1xuICAgICAgaWYgKGlzRGltRGVmaW5lZChub2RlLCByZXNvbHZlZFJvd0F4aXMpKSB7XG4gICAgICAgIHdpZHRoID0gbm9kZS5zdHlsZS53aWR0aDtcbiAgICAgIH0gZWxzZSBpZiAoaXNSZXNvbHZlZFJvd0RpbURlZmluZWQpIHtcbiAgICAgICAgd2lkdGggPSBub2RlLmxheW91dFtkaW1bcmVzb2x2ZWRSb3dBeGlzXV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aWR0aCA9IHBhcmVudE1heFdpZHRoIC1cbiAgICAgICAgICBnZXRNYXJnaW5BeGlzKG5vZGUsIHJlc29sdmVkUm93QXhpcyk7XG4gICAgICB9XG4gICAgICB3aWR0aCAtPSBwYWRkaW5nQW5kQm9yZGVyQXhpc1Jlc29sdmVkUm93O1xuXG4gICAgICAvLyBXZSBvbmx5IG5lZWQgdG8gZ2l2ZSBhIGRpbWVuc2lvbiBmb3IgdGhlIHRleHQgaWYgd2UgaGF2ZW4ndCBnb3QgYW55XG4gICAgICAvLyBmb3IgaXQgY29tcHV0ZWQgeWV0LiBJdCBjYW4gZWl0aGVyIGJlIGZyb20gdGhlIHN0eWxlIGF0dHJpYnV0ZSBvciBiZWNhdXNlXG4gICAgICAvLyB0aGUgZWxlbWVudCBpcyBmbGV4aWJsZS5cbiAgICAgIHZhci8qYm9vbCovIGlzUm93VW5kZWZpbmVkID0gIWlzRGltRGVmaW5lZChub2RlLCByZXNvbHZlZFJvd0F4aXMpICYmICFpc1Jlc29sdmVkUm93RGltRGVmaW5lZDtcbiAgICAgIHZhci8qYm9vbCovIGlzQ29sdW1uVW5kZWZpbmVkID0gIWlzRGltRGVmaW5lZChub2RlLCBDU1NfRkxFWF9ESVJFQ1RJT05fQ09MVU1OKSAmJlxuICAgICAgICBpc1VuZGVmaW5lZChub2RlLmxheW91dFtkaW1bQ1NTX0ZMRVhfRElSRUNUSU9OX0NPTFVNTl1dKTtcblxuICAgICAgLy8gTGV0J3Mgbm90IG1lYXN1cmUgdGhlIHRleHQgaWYgd2UgYWxyZWFkeSBrbm93IGJvdGggZGltZW5zaW9uc1xuICAgICAgaWYgKGlzUm93VW5kZWZpbmVkIHx8IGlzQ29sdW1uVW5kZWZpbmVkKSB7XG4gICAgICAgIHZhci8qY3NzX2RpbV90Ki8gbWVhc3VyZURpbSA9IG5vZGUuc3R5bGUubWVhc3VyZShcbiAgICAgICAgICAvKihjKSFub2RlLT5jb250ZXh0LCovXG4gICAgICAgICAgLyooamF2YSkhbGF5b3V0Q29udGV4dC5tZWFzdXJlT3V0cHV0LCovXG4gICAgICAgICAgd2lkdGhcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGlzUm93VW5kZWZpbmVkKSB7XG4gICAgICAgICAgbm9kZS5sYXlvdXQud2lkdGggPSBtZWFzdXJlRGltLndpZHRoICtcbiAgICAgICAgICAgIHBhZGRpbmdBbmRCb3JkZXJBeGlzUmVzb2x2ZWRSb3c7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ29sdW1uVW5kZWZpbmVkKSB7XG4gICAgICAgICAgbm9kZS5sYXlvdXQuaGVpZ2h0ID0gbWVhc3VyZURpbS5oZWlnaHQgK1xuICAgICAgICAgICAgZ2V0UGFkZGluZ0FuZEJvcmRlckF4aXMobm9kZSwgQ1NTX0ZMRVhfRElSRUNUSU9OX0NPTFVNTik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjaGlsZENvdW50ID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIvKmJvb2wqLyBpc05vZGVGbGV4V3JhcCA9IGlzRmxleFdyYXAobm9kZSk7XG5cbiAgICB2YXIvKmNzc19qdXN0aWZ5X3QqLyBqdXN0aWZ5Q29udGVudCA9IGdldEp1c3RpZnlDb250ZW50KG5vZGUpO1xuXG4gICAgdmFyLypmbG9hdCovIGxlYWRpbmdQYWRkaW5nQW5kQm9yZGVyTWFpbiA9IGdldExlYWRpbmdQYWRkaW5nQW5kQm9yZGVyKG5vZGUsIG1haW5BeGlzKTtcbiAgICB2YXIvKmZsb2F0Ki8gbGVhZGluZ1BhZGRpbmdBbmRCb3JkZXJDcm9zcyA9IGdldExlYWRpbmdQYWRkaW5nQW5kQm9yZGVyKG5vZGUsIGNyb3NzQXhpcyk7XG4gICAgdmFyLypmbG9hdCovIHBhZGRpbmdBbmRCb3JkZXJBeGlzTWFpbiA9IGdldFBhZGRpbmdBbmRCb3JkZXJBeGlzKG5vZGUsIG1haW5BeGlzKTtcbiAgICB2YXIvKmZsb2F0Ki8gcGFkZGluZ0FuZEJvcmRlckF4aXNDcm9zcyA9IGdldFBhZGRpbmdBbmRCb3JkZXJBeGlzKG5vZGUsIGNyb3NzQXhpcyk7XG5cbiAgICB2YXIvKmJvb2wqLyBpc01haW5EaW1EZWZpbmVkID0gIWlzVW5kZWZpbmVkKG5vZGUubGF5b3V0W2RpbVttYWluQXhpc11dKTtcbiAgICB2YXIvKmJvb2wqLyBpc0Nyb3NzRGltRGVmaW5lZCA9ICFpc1VuZGVmaW5lZChub2RlLmxheW91dFtkaW1bY3Jvc3NBeGlzXV0pO1xuICAgIHZhci8qYm9vbCovIGlzTWFpblJvd0RpcmVjdGlvbiA9IGlzUm93RGlyZWN0aW9uKG1haW5BeGlzKTtcblxuICAgIHZhci8qaW50Ki8gaTtcbiAgICB2YXIvKmludCovIGlpO1xuICAgIHZhci8qY3NzX25vZGVfdCoqLyBjaGlsZDtcbiAgICB2YXIvKihjKSFjc3NfZmxleF9kaXJlY3Rpb25fdCovLyooamF2YSkhaW50Ki8gYXhpcztcblxuICAgIHZhci8qY3NzX25vZGVfdCoqLyBmaXJzdEFic29sdXRlQ2hpbGQgPSBudWxsO1xuICAgIHZhci8qY3NzX25vZGVfdCoqLyBjdXJyZW50QWJzb2x1dGVDaGlsZCA9IG51bGw7XG5cbiAgICB2YXIvKmZsb2F0Ki8gZGVmaW5lZE1haW5EaW0gPSBDU1NfVU5ERUZJTkVEO1xuICAgIGlmIChpc01haW5EaW1EZWZpbmVkKSB7XG4gICAgICBkZWZpbmVkTWFpbkRpbSA9IG5vZGUubGF5b3V0W2RpbVttYWluQXhpc11dIC0gcGFkZGluZ0FuZEJvcmRlckF4aXNNYWluO1xuICAgIH1cblxuICAgIC8vIFdlIHdhbnQgdG8gZXhlY3V0ZSB0aGUgbmV4dCB0d28gbG9vcHMgb25lIHBlciBsaW5lIHdpdGggZmxleC13cmFwXG4gICAgdmFyLyppbnQqLyBzdGFydExpbmUgPSAwO1xuICAgIHZhci8qaW50Ki8gZW5kTGluZSA9IDA7XG4gICAgLy8gdmFyLyppbnQqLyBuZXh0T2Zmc2V0ID0gMDtcbiAgICB2YXIvKmludCovIGFscmVhZHlDb21wdXRlZE5leHRMYXlvdXQgPSAwO1xuICAgIC8vIFdlIGFnZ3JlZ2F0ZSB0aGUgdG90YWwgZGltZW5zaW9ucyBvZiB0aGUgY29udGFpbmVyIGluIHRob3NlIHR3byB2YXJpYWJsZXNcbiAgICB2YXIvKmZsb2F0Ki8gbGluZXNDcm9zc0RpbSA9IDA7XG4gICAgdmFyLypmbG9hdCovIGxpbmVzTWFpbkRpbSA9IDA7XG4gICAgdmFyLyppbnQqLyBsaW5lc0NvdW50ID0gMDtcbiAgICB3aGlsZSAoZW5kTGluZSA8IGNoaWxkQ291bnQpIHtcbiAgICAgIC8vIDxMb29wIEE+IExheW91dCBub24gZmxleGlibGUgY2hpbGRyZW4gYW5kIGNvdW50IGNoaWxkcmVuIGJ5IHR5cGVcblxuICAgICAgLy8gbWFpbkNvbnRlbnREaW0gaXMgYWNjdW11bGF0aW9uIG9mIHRoZSBkaW1lbnNpb25zIGFuZCBtYXJnaW4gb2YgYWxsIHRoZVxuICAgICAgLy8gbm9uIGZsZXhpYmxlIGNoaWxkcmVuLiBUaGlzIHdpbGwgYmUgdXNlZCBpbiBvcmRlciB0byBlaXRoZXIgc2V0IHRoZVxuICAgICAgLy8gZGltZW5zaW9ucyBvZiB0aGUgbm9kZSBpZiBub25lIGFscmVhZHkgZXhpc3QsIG9yIHRvIGNvbXB1dGUgdGhlXG4gICAgICAvLyByZW1haW5pbmcgc3BhY2UgbGVmdCBmb3IgdGhlIGZsZXhpYmxlIGNoaWxkcmVuLlxuICAgICAgdmFyLypmbG9hdCovIG1haW5Db250ZW50RGltID0gMDtcblxuICAgICAgLy8gVGhlcmUgYXJlIHRocmVlIGtpbmQgb2YgY2hpbGRyZW4sIG5vbiBmbGV4aWJsZSwgZmxleGlibGUgYW5kIGFic29sdXRlLlxuICAgICAgLy8gV2UgbmVlZCB0byBrbm93IGhvdyBtYW55IHRoZXJlIGFyZSBpbiBvcmRlciB0byBkaXN0cmlidXRlIHRoZSBzcGFjZS5cbiAgICAgIHZhci8qaW50Ki8gZmxleGlibGVDaGlsZHJlbkNvdW50ID0gMDtcbiAgICAgIHZhci8qZmxvYXQqLyB0b3RhbEZsZXhpYmxlID0gMDtcbiAgICAgIHZhci8qaW50Ki8gbm9uRmxleGlibGVDaGlsZHJlbkNvdW50ID0gMDtcblxuICAgICAgLy8gVXNlIHRoZSBsaW5lIGxvb3AgdG8gcG9zaXRpb24gY2hpbGRyZW4gaW4gdGhlIG1haW4gYXhpcyBmb3IgYXMgbG9uZ1xuICAgICAgLy8gYXMgdGhleSBhcmUgdXNpbmcgYSBzaW1wbGUgc3RhY2tpbmcgYmVoYXZpb3VyLiBDaGlsZHJlbiB0aGF0IGFyZVxuICAgICAgLy8gaW1tZWRpYXRlbHkgc3RhY2tlZCBpbiB0aGUgaW5pdGlhbCBsb29wIHdpbGwgbm90IGJlIHRvdWNoZWQgYWdhaW5cbiAgICAgIC8vIGluIDxMb29wIEM+LlxuICAgICAgdmFyLypib29sKi8gaXNTaW1wbGVTdGFja01haW4gPVxuICAgICAgICAgIChpc01haW5EaW1EZWZpbmVkICYmIGp1c3RpZnlDb250ZW50ID09PSBDU1NfSlVTVElGWV9GTEVYX1NUQVJUKSB8fFxuICAgICAgICAgICghaXNNYWluRGltRGVmaW5lZCAmJiBqdXN0aWZ5Q29udGVudCAhPT0gQ1NTX0pVU1RJRllfQ0VOVEVSKTtcbiAgICAgIHZhci8qaW50Ki8gZmlyc3RDb21wbGV4TWFpbiA9IChpc1NpbXBsZVN0YWNrTWFpbiA/IGNoaWxkQ291bnQgOiBzdGFydExpbmUpO1xuXG4gICAgICAvLyBVc2UgdGhlIGluaXRpYWwgbGluZSBsb29wIHRvIHBvc2l0aW9uIGNoaWxkcmVuIGluIHRoZSBjcm9zcyBheGlzIGZvclxuICAgICAgLy8gYXMgbG9uZyBhcyB0aGV5IGFyZSByZWxhdGl2ZWx5IHBvc2l0aW9uZWQgd2l0aCBhbGlnbm1lbnQgU1RSRVRDSCBvclxuICAgICAgLy8gRkxFWF9TVEFSVC4gQ2hpbGRyZW4gdGhhdCBhcmUgaW1tZWRpYXRlbHkgc3RhY2tlZCBpbiB0aGUgaW5pdGlhbCBsb29wXG4gICAgICAvLyB3aWxsIG5vdCBiZSB0b3VjaGVkIGFnYWluIGluIDxMb29wIEQ+LlxuICAgICAgdmFyLypib29sKi8gaXNTaW1wbGVTdGFja0Nyb3NzID0gdHJ1ZTtcbiAgICAgIHZhci8qaW50Ki8gZmlyc3RDb21wbGV4Q3Jvc3MgPSBjaGlsZENvdW50O1xuXG4gICAgICB2YXIvKmNzc19ub2RlX3QqKi8gZmlyc3RGbGV4Q2hpbGQgPSBudWxsO1xuICAgICAgdmFyLypjc3Nfbm9kZV90KiovIGN1cnJlbnRGbGV4Q2hpbGQgPSBudWxsO1xuXG4gICAgICB2YXIvKmZsb2F0Ki8gbWFpbkRpbSA9IGxlYWRpbmdQYWRkaW5nQW5kQm9yZGVyTWFpbjtcbiAgICAgIHZhci8qZmxvYXQqLyBjcm9zc0RpbSA9IDA7XG5cbiAgICAgIHZhci8qZmxvYXQqLyBtYXhXaWR0aDtcbiAgICAgIGZvciAoaSA9IHN0YXJ0TGluZTsgaSA8IGNoaWxkQ291bnQ7ICsraSkge1xuICAgICAgICBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICAgIGNoaWxkLmxpbmVJbmRleCA9IGxpbmVzQ291bnQ7XG5cbiAgICAgICAgY2hpbGQubmV4dEFic29sdXRlQ2hpbGQgPSBudWxsO1xuICAgICAgICBjaGlsZC5uZXh0RmxleENoaWxkID0gbnVsbDtcblxuICAgICAgICB2YXIvKmNzc19hbGlnbl90Ki8gYWxpZ25JdGVtID0gZ2V0QWxpZ25JdGVtKG5vZGUsIGNoaWxkKTtcblxuICAgICAgICAvLyBQcmUtZmlsbCBjcm9zcyBheGlzIGRpbWVuc2lvbnMgd2hlbiB0aGUgY2hpbGQgaXMgdXNpbmcgc3RyZXRjaCBiZWZvcmVcbiAgICAgICAgLy8gd2UgY2FsbCB0aGUgcmVjdXJzaXZlIGxheW91dCBwYXNzXG4gICAgICAgIGlmIChhbGlnbkl0ZW0gPT09IENTU19BTElHTl9TVFJFVENIICYmXG4gICAgICAgICAgICBnZXRQb3NpdGlvblR5cGUoY2hpbGQpID09PSBDU1NfUE9TSVRJT05fUkVMQVRJVkUgJiZcbiAgICAgICAgICAgIGlzQ3Jvc3NEaW1EZWZpbmVkICYmXG4gICAgICAgICAgICAhaXNEaW1EZWZpbmVkKGNoaWxkLCBjcm9zc0F4aXMpKSB7XG4gICAgICAgICAgY2hpbGQubGF5b3V0W2RpbVtjcm9zc0F4aXNdXSA9IGZtYXhmKFxuICAgICAgICAgICAgYm91bmRBeGlzKGNoaWxkLCBjcm9zc0F4aXMsIG5vZGUubGF5b3V0W2RpbVtjcm9zc0F4aXNdXSAtXG4gICAgICAgICAgICAgIHBhZGRpbmdBbmRCb3JkZXJBeGlzQ3Jvc3MgLSBnZXRNYXJnaW5BeGlzKGNoaWxkLCBjcm9zc0F4aXMpKSxcbiAgICAgICAgICAgIC8vIFlvdSBuZXZlciB3YW50IHRvIGdvIHNtYWxsZXIgdGhhbiBwYWRkaW5nXG4gICAgICAgICAgICBnZXRQYWRkaW5nQW5kQm9yZGVyQXhpcyhjaGlsZCwgY3Jvc3NBeGlzKVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoZ2V0UG9zaXRpb25UeXBlKGNoaWxkKSA9PT0gQ1NTX1BPU0lUSU9OX0FCU09MVVRFKSB7XG4gICAgICAgICAgLy8gU3RvcmUgYSBwcml2YXRlIGxpbmtlZCBsaXN0IG9mIGFic29sdXRlbHkgcG9zaXRpb25lZCBjaGlsZHJlblxuICAgICAgICAgIC8vIHNvIHRoYXQgd2UgY2FuIGVmZmljaWVudGx5IHRyYXZlcnNlIHRoZW0gbGF0ZXIuXG4gICAgICAgICAgaWYgKGZpcnN0QWJzb2x1dGVDaGlsZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgZmlyc3RBYnNvbHV0ZUNoaWxkID0gY2hpbGQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjdXJyZW50QWJzb2x1dGVDaGlsZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY3VycmVudEFic29sdXRlQ2hpbGQubmV4dEFic29sdXRlQ2hpbGQgPSBjaGlsZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudEFic29sdXRlQ2hpbGQgPSBjaGlsZDtcblxuICAgICAgICAgIC8vIFByZS1maWxsIGRpbWVuc2lvbnMgd2hlbiB1c2luZyBhYnNvbHV0ZSBwb3NpdGlvbiBhbmQgYm90aCBvZmZzZXRzIGZvciB0aGUgYXhpcyBhcmUgZGVmaW5lZCAoZWl0aGVyIGJvdGhcbiAgICAgICAgICAvLyBsZWZ0IGFuZCByaWdodCBvciB0b3AgYW5kIGJvdHRvbSkuXG4gICAgICAgICAgZm9yIChpaSA9IDA7IGlpIDwgMjsgaWkrKykge1xuICAgICAgICAgICAgYXhpcyA9IChpaSAhPT0gMCkgPyBDU1NfRkxFWF9ESVJFQ1RJT05fUk9XIDogQ1NTX0ZMRVhfRElSRUNUSU9OX0NPTFVNTjtcbiAgICAgICAgICAgIGlmICghaXNVbmRlZmluZWQobm9kZS5sYXlvdXRbZGltW2F4aXNdXSkgJiZcbiAgICAgICAgICAgICAgICAhaXNEaW1EZWZpbmVkKGNoaWxkLCBheGlzKSAmJlxuICAgICAgICAgICAgICAgIGlzUG9zRGVmaW5lZChjaGlsZCwgbGVhZGluZ1theGlzXSkgJiZcbiAgICAgICAgICAgICAgICBpc1Bvc0RlZmluZWQoY2hpbGQsIHRyYWlsaW5nW2F4aXNdKSkge1xuICAgICAgICAgICAgICBjaGlsZC5sYXlvdXRbZGltW2F4aXNdXSA9IGZtYXhmKFxuICAgICAgICAgICAgICAgIGJvdW5kQXhpcyhjaGlsZCwgYXhpcywgbm9kZS5sYXlvdXRbZGltW2F4aXNdXSAtXG4gICAgICAgICAgICAgICAgICBnZXRQYWRkaW5nQW5kQm9yZGVyQXhpcyhub2RlLCBheGlzKSAtXG4gICAgICAgICAgICAgICAgICBnZXRNYXJnaW5BeGlzKGNoaWxkLCBheGlzKSAtXG4gICAgICAgICAgICAgICAgICBnZXRQb3NpdGlvbihjaGlsZCwgbGVhZGluZ1theGlzXSkgLVxuICAgICAgICAgICAgICAgICAgZ2V0UG9zaXRpb24oY2hpbGQsIHRyYWlsaW5nW2F4aXNdKSksXG4gICAgICAgICAgICAgICAgLy8gWW91IG5ldmVyIHdhbnQgdG8gZ28gc21hbGxlciB0aGFuIHBhZGRpbmdcbiAgICAgICAgICAgICAgICBnZXRQYWRkaW5nQW5kQm9yZGVyQXhpcyhjaGlsZCwgYXhpcylcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIvKmZsb2F0Ki8gbmV4dENvbnRlbnREaW0gPSAwO1xuXG4gICAgICAgIC8vIEl0IG9ubHkgbWFrZXMgc2Vuc2UgdG8gY29uc2lkZXIgYSBjaGlsZCBmbGV4aWJsZSBpZiB3ZSBoYXZlIGEgY29tcHV0ZWRcbiAgICAgICAgLy8gZGltZW5zaW9uIGZvciB0aGUgbm9kZS5cbiAgICAgICAgaWYgKGlzTWFpbkRpbURlZmluZWQgJiYgaXNGbGV4KGNoaWxkKSkge1xuICAgICAgICAgIGZsZXhpYmxlQ2hpbGRyZW5Db3VudCsrO1xuICAgICAgICAgIHRvdGFsRmxleGlibGUgKz0gY2hpbGQuc3R5bGUuZmxleDtcblxuICAgICAgICAgIC8vIFN0b3JlIGEgcHJpdmF0ZSBsaW5rZWQgbGlzdCBvZiBmbGV4aWJsZSBjaGlsZHJlbiBzbyB0aGF0IHdlIGNhblxuICAgICAgICAgIC8vIGVmZmljaWVudGx5IHRyYXZlcnNlIHRoZW0gbGF0ZXIuXG4gICAgICAgICAgaWYgKGZpcnN0RmxleENoaWxkID09PSBudWxsKSB7XG4gICAgICAgICAgICBmaXJzdEZsZXhDaGlsZCA9IGNoaWxkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY3VycmVudEZsZXhDaGlsZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY3VycmVudEZsZXhDaGlsZC5uZXh0RmxleENoaWxkID0gY2hpbGQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnJlbnRGbGV4Q2hpbGQgPSBjaGlsZDtcblxuICAgICAgICAgIC8vIEV2ZW4gaWYgd2UgZG9uJ3Qga25vdyBpdHMgZXhhY3Qgc2l6ZSB5ZXQsIHdlIGFscmVhZHkga25vdyB0aGUgcGFkZGluZyxcbiAgICAgICAgICAvLyBib3JkZXIgYW5kIG1hcmdpbi4gV2UnbGwgdXNlIHRoaXMgcGFydGlhbCBpbmZvcm1hdGlvbiwgd2hpY2ggcmVwcmVzZW50c1xuICAgICAgICAgIC8vIHRoZSBzbWFsbGVzdCBwb3NzaWJsZSBzaXplIGZvciB0aGUgY2hpbGQsIHRvIGNvbXB1dGUgdGhlIHJlbWFpbmluZ1xuICAgICAgICAgIC8vIGF2YWlsYWJsZSBzcGFjZS5cbiAgICAgICAgICBuZXh0Q29udGVudERpbSA9IGdldFBhZGRpbmdBbmRCb3JkZXJBeGlzKGNoaWxkLCBtYWluQXhpcykgK1xuICAgICAgICAgICAgZ2V0TWFyZ2luQXhpcyhjaGlsZCwgbWFpbkF4aXMpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF4V2lkdGggPSBDU1NfVU5ERUZJTkVEO1xuICAgICAgICAgIGlmICghaXNNYWluUm93RGlyZWN0aW9uKSB7XG4gICAgICAgICAgICBpZiAoaXNEaW1EZWZpbmVkKG5vZGUsIHJlc29sdmVkUm93QXhpcykpIHtcbiAgICAgICAgICAgICAgbWF4V2lkdGggPSBub2RlLmxheW91dFtkaW1bcmVzb2x2ZWRSb3dBeGlzXV0gLVxuICAgICAgICAgICAgICAgIHBhZGRpbmdBbmRCb3JkZXJBeGlzUmVzb2x2ZWRSb3c7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtYXhXaWR0aCA9IHBhcmVudE1heFdpZHRoIC1cbiAgICAgICAgICAgICAgICBnZXRNYXJnaW5BeGlzKG5vZGUsIHJlc29sdmVkUm93QXhpcykgLVxuICAgICAgICAgICAgICAgIHBhZGRpbmdBbmRCb3JkZXJBeGlzUmVzb2x2ZWRSb3c7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVGhpcyBpcyB0aGUgbWFpbiByZWN1cnNpdmUgY2FsbC4gV2UgbGF5b3V0IG5vbiBmbGV4aWJsZSBjaGlsZHJlbi5cbiAgICAgICAgICBpZiAoYWxyZWFkeUNvbXB1dGVkTmV4dExheW91dCA9PT0gMCkge1xuICAgICAgICAgICAgbGF5b3V0Tm9kZSgvKihqYXZhKSFsYXlvdXRDb250ZXh0LCAqL2NoaWxkLCBtYXhXaWR0aCwgZGlyZWN0aW9uKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBYnNvbHV0ZSBwb3NpdGlvbmVkIGVsZW1lbnRzIGRvIG5vdCB0YWtlIHBhcnQgb2YgdGhlIGxheW91dCwgc28gd2VcbiAgICAgICAgICAvLyBkb24ndCB1c2UgdGhlbSB0byBjb21wdXRlIG1haW5Db250ZW50RGltXG4gICAgICAgICAgaWYgKGdldFBvc2l0aW9uVHlwZShjaGlsZCkgPT09IENTU19QT1NJVElPTl9SRUxBVElWRSkge1xuICAgICAgICAgICAgbm9uRmxleGlibGVDaGlsZHJlbkNvdW50Kys7XG4gICAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50IHdlIGtub3cgdGhlIGZpbmFsIHNpemUgYW5kIG1hcmdpbiBvZiB0aGUgZWxlbWVudC5cbiAgICAgICAgICAgIG5leHRDb250ZW50RGltID0gZ2V0RGltV2l0aE1hcmdpbihjaGlsZCwgbWFpbkF4aXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBlbGVtZW50IHdlIGFyZSBhYm91dCB0byBhZGQgd291bGQgbWFrZSB1cyBnbyB0byB0aGUgbmV4dCBsaW5lXG4gICAgICAgIGlmIChpc05vZGVGbGV4V3JhcCAmJlxuICAgICAgICAgICAgaXNNYWluRGltRGVmaW5lZCAmJlxuICAgICAgICAgICAgbWFpbkNvbnRlbnREaW0gKyBuZXh0Q29udGVudERpbSA+IGRlZmluZWRNYWluRGltICYmXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG9ubHkgb25lIGVsZW1lbnQsIHRoZW4gaXQncyBiaWdnZXIgdGhhbiB0aGUgY29udGVudFxuICAgICAgICAgICAgLy8gYW5kIG5lZWRzIGl0cyBvd24gbGluZVxuICAgICAgICAgICAgaSAhPT0gc3RhcnRMaW5lKSB7XG4gICAgICAgICAgbm9uRmxleGlibGVDaGlsZHJlbkNvdW50LS07XG4gICAgICAgICAgYWxyZWFkeUNvbXB1dGVkTmV4dExheW91dCA9IDE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEaXNhYmxlIHNpbXBsZSBzdGFja2luZyBpbiB0aGUgbWFpbiBheGlzIGZvciB0aGUgY3VycmVudCBsaW5lIGFzXG4gICAgICAgIC8vIHdlIGZvdW5kIGEgbm9uLXRyaXZpYWwgY2hpbGQuIFRoZSByZW1haW5pbmcgY2hpbGRyZW4gd2lsbCBiZSBsYWlkIG91dFxuICAgICAgICAvLyBpbiA8TG9vcCBDPi5cbiAgICAgICAgaWYgKGlzU2ltcGxlU3RhY2tNYWluICYmXG4gICAgICAgICAgICAoZ2V0UG9zaXRpb25UeXBlKGNoaWxkKSAhPT0gQ1NTX1BPU0lUSU9OX1JFTEFUSVZFIHx8IGlzRmxleChjaGlsZCkpKSB7XG4gICAgICAgICAgaXNTaW1wbGVTdGFja01haW4gPSBmYWxzZTtcbiAgICAgICAgICBmaXJzdENvbXBsZXhNYWluID0gaTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERpc2FibGUgc2ltcGxlIHN0YWNraW5nIGluIHRoZSBjcm9zcyBheGlzIGZvciB0aGUgY3VycmVudCBsaW5lIGFzXG4gICAgICAgIC8vIHdlIGZvdW5kIGEgbm9uLXRyaXZpYWwgY2hpbGQuIFRoZSByZW1haW5pbmcgY2hpbGRyZW4gd2lsbCBiZSBsYWlkIG91dFxuICAgICAgICAvLyBpbiA8TG9vcCBEPi5cbiAgICAgICAgaWYgKGlzU2ltcGxlU3RhY2tDcm9zcyAmJlxuICAgICAgICAgICAgKGdldFBvc2l0aW9uVHlwZShjaGlsZCkgIT09IENTU19QT1NJVElPTl9SRUxBVElWRSB8fFxuICAgICAgICAgICAgICAgIChhbGlnbkl0ZW0gIT09IENTU19BTElHTl9TVFJFVENIICYmIGFsaWduSXRlbSAhPT0gQ1NTX0FMSUdOX0ZMRVhfU1RBUlQpIHx8XG4gICAgICAgICAgICAgICAgaXNVbmRlZmluZWQoY2hpbGQubGF5b3V0W2RpbVtjcm9zc0F4aXNdXSkpKSB7XG4gICAgICAgICAgaXNTaW1wbGVTdGFja0Nyb3NzID0gZmFsc2U7XG4gICAgICAgICAgZmlyc3RDb21wbGV4Q3Jvc3MgPSBpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzU2ltcGxlU3RhY2tNYWluKSB7XG4gICAgICAgICAgY2hpbGQubGF5b3V0W3Bvc1ttYWluQXhpc11dICs9IG1haW5EaW07XG4gICAgICAgICAgaWYgKGlzTWFpbkRpbURlZmluZWQpIHtcbiAgICAgICAgICAgIHNldFRyYWlsaW5nUG9zaXRpb24obm9kZSwgY2hpbGQsIG1haW5BeGlzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtYWluRGltICs9IGdldERpbVdpdGhNYXJnaW4oY2hpbGQsIG1haW5BeGlzKTtcbiAgICAgICAgICBjcm9zc0RpbSA9IGZtYXhmKGNyb3NzRGltLCBib3VuZEF4aXMoY2hpbGQsIGNyb3NzQXhpcywgZ2V0RGltV2l0aE1hcmdpbihjaGlsZCwgY3Jvc3NBeGlzKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzU2ltcGxlU3RhY2tDcm9zcykge1xuICAgICAgICAgIGNoaWxkLmxheW91dFtwb3NbY3Jvc3NBeGlzXV0gKz0gbGluZXNDcm9zc0RpbSArIGxlYWRpbmdQYWRkaW5nQW5kQm9yZGVyQ3Jvc3M7XG4gICAgICAgICAgaWYgKGlzQ3Jvc3NEaW1EZWZpbmVkKSB7XG4gICAgICAgICAgICBzZXRUcmFpbGluZ1Bvc2l0aW9uKG5vZGUsIGNoaWxkLCBjcm9zc0F4aXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGFscmVhZHlDb21wdXRlZE5leHRMYXlvdXQgPSAwO1xuICAgICAgICBtYWluQ29udGVudERpbSArPSBuZXh0Q29udGVudERpbTtcbiAgICAgICAgZW5kTGluZSA9IGkgKyAxO1xuICAgICAgfVxuXG4gICAgICAvLyA8TG9vcCBCPiBMYXlvdXQgZmxleGlibGUgY2hpbGRyZW4gYW5kIGFsbG9jYXRlIGVtcHR5IHNwYWNlXG5cbiAgICAgIC8vIEluIG9yZGVyIHRvIHBvc2l0aW9uIHRoZSBlbGVtZW50cyBpbiB0aGUgbWFpbiBheGlzLCB3ZSBoYXZlIHR3b1xuICAgICAgLy8gY29udHJvbHMuIFRoZSBzcGFjZSBiZXR3ZWVuIHRoZSBiZWdpbm5pbmcgYW5kIHRoZSBmaXJzdCBlbGVtZW50XG4gICAgICAvLyBhbmQgdGhlIHNwYWNlIGJldHdlZW4gZWFjaCB0d28gZWxlbWVudHMuXG4gICAgICB2YXIvKmZsb2F0Ki8gbGVhZGluZ01haW5EaW0gPSAwO1xuICAgICAgdmFyLypmbG9hdCovIGJldHdlZW5NYWluRGltID0gMDtcblxuICAgICAgLy8gVGhlIHJlbWFpbmluZyBhdmFpbGFibGUgc3BhY2UgdGhhdCBuZWVkcyB0byBiZSBhbGxvY2F0ZWRcbiAgICAgIHZhci8qZmxvYXQqLyByZW1haW5pbmdNYWluRGltID0gMDtcbiAgICAgIGlmIChpc01haW5EaW1EZWZpbmVkKSB7XG4gICAgICAgIHJlbWFpbmluZ01haW5EaW0gPSBkZWZpbmVkTWFpbkRpbSAtIG1haW5Db250ZW50RGltO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVtYWluaW5nTWFpbkRpbSA9IGZtYXhmKG1haW5Db250ZW50RGltLCAwKSAtIG1haW5Db250ZW50RGltO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgZmxleGlibGUgY2hpbGRyZW4gaW4gdGhlIG1peCwgdGhleSBhcmUgZ29pbmcgdG8gZmlsbCB0aGVcbiAgICAgIC8vIHJlbWFpbmluZyBzcGFjZVxuICAgICAgaWYgKGZsZXhpYmxlQ2hpbGRyZW5Db3VudCAhPT0gMCkge1xuICAgICAgICB2YXIvKmZsb2F0Ki8gZmxleGlibGVNYWluRGltID0gcmVtYWluaW5nTWFpbkRpbSAvIHRvdGFsRmxleGlibGU7XG4gICAgICAgIHZhci8qZmxvYXQqLyBiYXNlTWFpbkRpbTtcbiAgICAgICAgdmFyLypmbG9hdCovIGJvdW5kTWFpbkRpbTtcblxuICAgICAgICAvLyBJZiB0aGUgZmxleCBzaGFyZSBvZiByZW1haW5pbmcgc3BhY2UgZG9lc24ndCBtZWV0IG1pbi9tYXggYm91bmRzLFxuICAgICAgICAvLyByZW1vdmUgdGhpcyBjaGlsZCBmcm9tIGZsZXggY2FsY3VsYXRpb25zLlxuICAgICAgICBjdXJyZW50RmxleENoaWxkID0gZmlyc3RGbGV4Q2hpbGQ7XG4gICAgICAgIHdoaWxlIChjdXJyZW50RmxleENoaWxkICE9PSBudWxsKSB7XG4gICAgICAgICAgYmFzZU1haW5EaW0gPSBmbGV4aWJsZU1haW5EaW0gKiBjdXJyZW50RmxleENoaWxkLnN0eWxlLmZsZXggK1xuICAgICAgICAgICAgICBnZXRQYWRkaW5nQW5kQm9yZGVyQXhpcyhjdXJyZW50RmxleENoaWxkLCBtYWluQXhpcyk7XG4gICAgICAgICAgYm91bmRNYWluRGltID0gYm91bmRBeGlzKGN1cnJlbnRGbGV4Q2hpbGQsIG1haW5BeGlzLCBiYXNlTWFpbkRpbSk7XG5cbiAgICAgICAgICBpZiAoYmFzZU1haW5EaW0gIT09IGJvdW5kTWFpbkRpbSkge1xuICAgICAgICAgICAgcmVtYWluaW5nTWFpbkRpbSAtPSBib3VuZE1haW5EaW07XG4gICAgICAgICAgICB0b3RhbEZsZXhpYmxlIC09IGN1cnJlbnRGbGV4Q2hpbGQuc3R5bGUuZmxleDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjdXJyZW50RmxleENoaWxkID0gY3VycmVudEZsZXhDaGlsZC5uZXh0RmxleENoaWxkO1xuICAgICAgICB9XG4gICAgICAgIGZsZXhpYmxlTWFpbkRpbSA9IHJlbWFpbmluZ01haW5EaW0gLyB0b3RhbEZsZXhpYmxlO1xuXG4gICAgICAgIC8vIFRoZSBub24gZmxleGlibGUgY2hpbGRyZW4gY2FuIG92ZXJmbG93IHRoZSBjb250YWluZXIsIGluIHRoaXMgY2FzZVxuICAgICAgICAvLyB3ZSBzaG91bGQganVzdCBhc3N1bWUgdGhhdCB0aGVyZSBpcyBubyBzcGFjZSBhdmFpbGFibGUuXG4gICAgICAgIGlmIChmbGV4aWJsZU1haW5EaW0gPCAwKSB7XG4gICAgICAgICAgZmxleGlibGVNYWluRGltID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRGbGV4Q2hpbGQgPSBmaXJzdEZsZXhDaGlsZDtcbiAgICAgICAgd2hpbGUgKGN1cnJlbnRGbGV4Q2hpbGQgIT09IG51bGwpIHtcbiAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50IHdlIGtub3cgdGhlIGZpbmFsIHNpemUgb2YgdGhlIGVsZW1lbnQgaW4gdGhlIG1haW5cbiAgICAgICAgICAvLyBkaW1lbnNpb25cbiAgICAgICAgICBjdXJyZW50RmxleENoaWxkLmxheW91dFtkaW1bbWFpbkF4aXNdXSA9IGJvdW5kQXhpcyhjdXJyZW50RmxleENoaWxkLCBtYWluQXhpcyxcbiAgICAgICAgICAgIGZsZXhpYmxlTWFpbkRpbSAqIGN1cnJlbnRGbGV4Q2hpbGQuc3R5bGUuZmxleCArXG4gICAgICAgICAgICAgICAgZ2V0UGFkZGluZ0FuZEJvcmRlckF4aXMoY3VycmVudEZsZXhDaGlsZCwgbWFpbkF4aXMpXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIG1heFdpZHRoID0gQ1NTX1VOREVGSU5FRDtcbiAgICAgICAgICBpZiAoaXNEaW1EZWZpbmVkKG5vZGUsIHJlc29sdmVkUm93QXhpcykpIHtcbiAgICAgICAgICAgIG1heFdpZHRoID0gbm9kZS5sYXlvdXRbZGltW3Jlc29sdmVkUm93QXhpc11dIC1cbiAgICAgICAgICAgICAgcGFkZGluZ0FuZEJvcmRlckF4aXNSZXNvbHZlZFJvdztcbiAgICAgICAgICB9IGVsc2UgaWYgKCFpc01haW5Sb3dEaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIG1heFdpZHRoID0gcGFyZW50TWF4V2lkdGggLVxuICAgICAgICAgICAgICBnZXRNYXJnaW5BeGlzKG5vZGUsIHJlc29sdmVkUm93QXhpcykgLVxuICAgICAgICAgICAgICBwYWRkaW5nQW5kQm9yZGVyQXhpc1Jlc29sdmVkUm93O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEFuZCB3ZSByZWN1cnNpdmVseSBjYWxsIHRoZSBsYXlvdXQgYWxnb3JpdGhtIGZvciB0aGlzIGNoaWxkXG4gICAgICAgICAgbGF5b3V0Tm9kZSgvKihqYXZhKSFsYXlvdXRDb250ZXh0LCAqL2N1cnJlbnRGbGV4Q2hpbGQsIG1heFdpZHRoLCBkaXJlY3Rpb24pO1xuXG4gICAgICAgICAgY2hpbGQgPSBjdXJyZW50RmxleENoaWxkO1xuICAgICAgICAgIGN1cnJlbnRGbGV4Q2hpbGQgPSBjdXJyZW50RmxleENoaWxkLm5leHRGbGV4Q2hpbGQ7XG4gICAgICAgICAgY2hpbGQubmV4dEZsZXhDaGlsZCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgLy8gV2UgdXNlIGp1c3RpZnlDb250ZW50IHRvIGZpZ3VyZSBvdXQgaG93IHRvIGFsbG9jYXRlIHRoZSByZW1haW5pbmdcbiAgICAgIC8vIHNwYWNlIGF2YWlsYWJsZVxuICAgICAgfSBlbHNlIGlmIChqdXN0aWZ5Q29udGVudCAhPT0gQ1NTX0pVU1RJRllfRkxFWF9TVEFSVCkge1xuICAgICAgICBpZiAoanVzdGlmeUNvbnRlbnQgPT09IENTU19KVVNUSUZZX0NFTlRFUikge1xuICAgICAgICAgIGxlYWRpbmdNYWluRGltID0gcmVtYWluaW5nTWFpbkRpbSAvIDI7XG4gICAgICAgIH0gZWxzZSBpZiAoanVzdGlmeUNvbnRlbnQgPT09IENTU19KVVNUSUZZX0ZMRVhfRU5EKSB7XG4gICAgICAgICAgbGVhZGluZ01haW5EaW0gPSByZW1haW5pbmdNYWluRGltO1xuICAgICAgICB9IGVsc2UgaWYgKGp1c3RpZnlDb250ZW50ID09PSBDU1NfSlVTVElGWV9TUEFDRV9CRVRXRUVOKSB7XG4gICAgICAgICAgcmVtYWluaW5nTWFpbkRpbSA9IGZtYXhmKHJlbWFpbmluZ01haW5EaW0sIDApO1xuICAgICAgICAgIGlmIChmbGV4aWJsZUNoaWxkcmVuQ291bnQgKyBub25GbGV4aWJsZUNoaWxkcmVuQ291bnQgLSAxICE9PSAwKSB7XG4gICAgICAgICAgICBiZXR3ZWVuTWFpbkRpbSA9IHJlbWFpbmluZ01haW5EaW0gL1xuICAgICAgICAgICAgICAoZmxleGlibGVDaGlsZHJlbkNvdW50ICsgbm9uRmxleGlibGVDaGlsZHJlbkNvdW50IC0gMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJldHdlZW5NYWluRGltID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoanVzdGlmeUNvbnRlbnQgPT09IENTU19KVVNUSUZZX1NQQUNFX0FST1VORCkge1xuICAgICAgICAgIC8vIFNwYWNlIG9uIHRoZSBlZGdlcyBpcyBoYWxmIG9mIHRoZSBzcGFjZSBiZXR3ZWVuIGVsZW1lbnRzXG4gICAgICAgICAgYmV0d2Vlbk1haW5EaW0gPSByZW1haW5pbmdNYWluRGltIC9cbiAgICAgICAgICAgIChmbGV4aWJsZUNoaWxkcmVuQ291bnQgKyBub25GbGV4aWJsZUNoaWxkcmVuQ291bnQpO1xuICAgICAgICAgIGxlYWRpbmdNYWluRGltID0gYmV0d2Vlbk1haW5EaW0gLyAyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIDxMb29wIEM+IFBvc2l0aW9uIGVsZW1lbnRzIGluIHRoZSBtYWluIGF4aXMgYW5kIGNvbXB1dGUgZGltZW5zaW9uc1xuXG4gICAgICAvLyBBdCB0aGlzIHBvaW50LCBhbGwgdGhlIGNoaWxkcmVuIGhhdmUgdGhlaXIgZGltZW5zaW9ucyBzZXQuIFdlIG5lZWQgdG9cbiAgICAgIC8vIGZpbmQgdGhlaXIgcG9zaXRpb24uIEluIG9yZGVyIHRvIGRvIHRoYXQsIHdlIGFjY3VtdWxhdGUgZGF0YSBpblxuICAgICAgLy8gdmFyaWFibGVzIHRoYXQgYXJlIGFsc28gdXNlZnVsIHRvIGNvbXB1dGUgdGhlIHRvdGFsIGRpbWVuc2lvbnMgb2YgdGhlXG4gICAgICAvLyBjb250YWluZXIhXG4gICAgICBtYWluRGltICs9IGxlYWRpbmdNYWluRGltO1xuXG4gICAgICBmb3IgKGkgPSBmaXJzdENvbXBsZXhNYWluOyBpIDwgZW5kTGluZTsgKytpKSB7XG4gICAgICAgIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcblxuICAgICAgICBpZiAoZ2V0UG9zaXRpb25UeXBlKGNoaWxkKSA9PT0gQ1NTX1BPU0lUSU9OX0FCU09MVVRFICYmXG4gICAgICAgICAgICBpc1Bvc0RlZmluZWQoY2hpbGQsIGxlYWRpbmdbbWFpbkF4aXNdKSkge1xuICAgICAgICAgIC8vIEluIGNhc2UgdGhlIGNoaWxkIGlzIHBvc2l0aW9uIGFic29sdXRlIGFuZCBoYXMgbGVmdC90b3AgYmVpbmdcbiAgICAgICAgICAvLyBkZWZpbmVkLCB3ZSBvdmVycmlkZSB0aGUgcG9zaXRpb24gdG8gd2hhdGV2ZXIgdGhlIHVzZXIgc2FpZFxuICAgICAgICAgIC8vIChhbmQgbWFyZ2luL2JvcmRlcikuXG4gICAgICAgICAgY2hpbGQubGF5b3V0W3Bvc1ttYWluQXhpc11dID0gZ2V0UG9zaXRpb24oY2hpbGQsIGxlYWRpbmdbbWFpbkF4aXNdKSArXG4gICAgICAgICAgICBnZXRMZWFkaW5nQm9yZGVyKG5vZGUsIG1haW5BeGlzKSArXG4gICAgICAgICAgICBnZXRMZWFkaW5nTWFyZ2luKGNoaWxkLCBtYWluQXhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGNoaWxkIGlzIHBvc2l0aW9uIGFic29sdXRlICh3aXRob3V0IHRvcC9sZWZ0KSBvciByZWxhdGl2ZSxcbiAgICAgICAgICAvLyB3ZSBwdXQgaXQgYXQgdGhlIGN1cnJlbnQgYWNjdW11bGF0ZWQgb2Zmc2V0LlxuICAgICAgICAgIGNoaWxkLmxheW91dFtwb3NbbWFpbkF4aXNdXSArPSBtYWluRGltO1xuXG4gICAgICAgICAgLy8gRGVmaW5lIHRoZSB0cmFpbGluZyBwb3NpdGlvbiBhY2NvcmRpbmdseS5cbiAgICAgICAgICBpZiAoaXNNYWluRGltRGVmaW5lZCkge1xuICAgICAgICAgICAgc2V0VHJhaWxpbmdQb3NpdGlvbihub2RlLCBjaGlsZCwgbWFpbkF4aXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIE5vdyB0aGF0IHdlIHBsYWNlZCB0aGUgZWxlbWVudCwgd2UgbmVlZCB0byB1cGRhdGUgdGhlIHZhcmlhYmxlc1xuICAgICAgICAgIC8vIFdlIG9ubHkgbmVlZCB0byBkbyB0aGF0IGZvciByZWxhdGl2ZSBlbGVtZW50cy4gQWJzb2x1dGUgZWxlbWVudHNcbiAgICAgICAgICAvLyBkbyBub3QgdGFrZSBwYXJ0IGluIHRoYXQgcGhhc2UuXG4gICAgICAgICAgaWYgKGdldFBvc2l0aW9uVHlwZShjaGlsZCkgPT09IENTU19QT1NJVElPTl9SRUxBVElWRSkge1xuICAgICAgICAgICAgLy8gVGhlIG1haW4gZGltZW5zaW9uIGlzIHRoZSBzdW0gb2YgYWxsIHRoZSBlbGVtZW50cyBkaW1lbnNpb24gcGx1c1xuICAgICAgICAgICAgLy8gdGhlIHNwYWNpbmcuXG4gICAgICAgICAgICBtYWluRGltICs9IGJldHdlZW5NYWluRGltICsgZ2V0RGltV2l0aE1hcmdpbihjaGlsZCwgbWFpbkF4aXMpO1xuICAgICAgICAgICAgLy8gVGhlIGNyb3NzIGRpbWVuc2lvbiBpcyB0aGUgbWF4IG9mIHRoZSBlbGVtZW50cyBkaW1lbnNpb24gc2luY2UgdGhlcmVcbiAgICAgICAgICAgIC8vIGNhbiBvbmx5IGJlIG9uZSBlbGVtZW50IGluIHRoYXQgY3Jvc3MgZGltZW5zaW9uLlxuICAgICAgICAgICAgY3Jvc3NEaW0gPSBmbWF4Zihjcm9zc0RpbSwgYm91bmRBeGlzKGNoaWxkLCBjcm9zc0F4aXMsIGdldERpbVdpdGhNYXJnaW4oY2hpbGQsIGNyb3NzQXhpcykpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyLypmbG9hdCovIGNvbnRhaW5lckNyb3NzQXhpcyA9IG5vZGUubGF5b3V0W2RpbVtjcm9zc0F4aXNdXTtcbiAgICAgIGlmICghaXNDcm9zc0RpbURlZmluZWQpIHtcbiAgICAgICAgY29udGFpbmVyQ3Jvc3NBeGlzID0gZm1heGYoXG4gICAgICAgICAgLy8gRm9yIHRoZSBjcm9zcyBkaW0sIHdlIGFkZCBib3RoIHNpZGVzIGF0IHRoZSBlbmQgYmVjYXVzZSB0aGUgdmFsdWVcbiAgICAgICAgICAvLyBpcyBhZ2dyZWdhdGUgdmlhIGEgbWF4IGZ1bmN0aW9uLiBJbnRlcm1lZGlhdGUgbmVnYXRpdmUgdmFsdWVzXG4gICAgICAgICAgLy8gY2FuIG1lc3MgdGhpcyBjb21wdXRhdGlvbiBvdGhlcndpc2VcbiAgICAgICAgICBib3VuZEF4aXMobm9kZSwgY3Jvc3NBeGlzLCBjcm9zc0RpbSArIHBhZGRpbmdBbmRCb3JkZXJBeGlzQ3Jvc3MpLFxuICAgICAgICAgIHBhZGRpbmdBbmRCb3JkZXJBeGlzQ3Jvc3NcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gPExvb3AgRD4gUG9zaXRpb24gZWxlbWVudHMgaW4gdGhlIGNyb3NzIGF4aXNcbiAgICAgIGZvciAoaSA9IGZpcnN0Q29tcGxleENyb3NzOyBpIDwgZW5kTGluZTsgKytpKSB7XG4gICAgICAgIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcblxuICAgICAgICBpZiAoZ2V0UG9zaXRpb25UeXBlKGNoaWxkKSA9PT0gQ1NTX1BPU0lUSU9OX0FCU09MVVRFICYmXG4gICAgICAgICAgICBpc1Bvc0RlZmluZWQoY2hpbGQsIGxlYWRpbmdbY3Jvc3NBeGlzXSkpIHtcbiAgICAgICAgICAvLyBJbiBjYXNlIHRoZSBjaGlsZCBpcyBhYnNvbHV0ZWx5IHBvc2l0aW9ubmVkIGFuZCBoYXMgYVxuICAgICAgICAgIC8vIHRvcC9sZWZ0L2JvdHRvbS9yaWdodCBiZWluZyBzZXQsIHdlIG92ZXJyaWRlIGFsbCB0aGUgcHJldmlvdXNseVxuICAgICAgICAgIC8vIGNvbXB1dGVkIHBvc2l0aW9ucyB0byBzZXQgaXQgY29ycmVjdGx5LlxuICAgICAgICAgIGNoaWxkLmxheW91dFtwb3NbY3Jvc3NBeGlzXV0gPSBnZXRQb3NpdGlvbihjaGlsZCwgbGVhZGluZ1tjcm9zc0F4aXNdKSArXG4gICAgICAgICAgICBnZXRMZWFkaW5nQm9yZGVyKG5vZGUsIGNyb3NzQXhpcykgK1xuICAgICAgICAgICAgZ2V0TGVhZGluZ01hcmdpbihjaGlsZCwgY3Jvc3NBeGlzKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhci8qZmxvYXQqLyBsZWFkaW5nQ3Jvc3NEaW0gPSBsZWFkaW5nUGFkZGluZ0FuZEJvcmRlckNyb3NzO1xuXG4gICAgICAgICAgLy8gRm9yIGEgcmVsYXRpdmUgY2hpbGRyZW4sIHdlJ3JlIGVpdGhlciB1c2luZyBhbGlnbkl0ZW1zIChwYXJlbnQpIG9yXG4gICAgICAgICAgLy8gYWxpZ25TZWxmIChjaGlsZCkgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHRoZSBwb3NpdGlvbiBpbiB0aGUgY3Jvc3MgYXhpc1xuICAgICAgICAgIGlmIChnZXRQb3NpdGlvblR5cGUoY2hpbGQpID09PSBDU1NfUE9TSVRJT05fUkVMQVRJVkUpIHtcbiAgICAgICAgICAgIC8qZXNsaW50LWRpc2FibGUgKi9cbiAgICAgICAgICAgIC8vIFRoaXMgdmFyaWFibGUgaXMgaW50ZW50aW9uYWxseSByZS1kZWZpbmVkIGFzIHRoZSBjb2RlIGlzIHRyYW5zcGlsZWQgdG8gYSBibG9jayBzY29wZSBsYW5ndWFnZVxuICAgICAgICAgICAgdmFyLypjc3NfYWxpZ25fdCovIGFsaWduSXRlbSA9IGdldEFsaWduSXRlbShub2RlLCBjaGlsZCk7XG4gICAgICAgICAgICAvKmVzbGludC1lbmFibGUgKi9cbiAgICAgICAgICAgIGlmIChhbGlnbkl0ZW0gPT09IENTU19BTElHTl9TVFJFVENIKSB7XG4gICAgICAgICAgICAgIC8vIFlvdSBjYW4gb25seSBzdHJldGNoIGlmIHRoZSBkaW1lbnNpb24gaGFzIG5vdCBhbHJlYWR5IGJlZW4gc2V0XG4gICAgICAgICAgICAgIC8vIHByZXZpb3VzbHkuXG4gICAgICAgICAgICAgIGlmIChpc1VuZGVmaW5lZChjaGlsZC5sYXlvdXRbZGltW2Nyb3NzQXhpc11dKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkLmxheW91dFtkaW1bY3Jvc3NBeGlzXV0gPSBmbWF4ZihcbiAgICAgICAgICAgICAgICAgIGJvdW5kQXhpcyhjaGlsZCwgY3Jvc3NBeGlzLCBjb250YWluZXJDcm9zc0F4aXMgLVxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQW5kQm9yZGVyQXhpc0Nyb3NzIC0gZ2V0TWFyZ2luQXhpcyhjaGlsZCwgY3Jvc3NBeGlzKSksXG4gICAgICAgICAgICAgICAgICAvLyBZb3UgbmV2ZXIgd2FudCB0byBnbyBzbWFsbGVyIHRoYW4gcGFkZGluZ1xuICAgICAgICAgICAgICAgICAgZ2V0UGFkZGluZ0FuZEJvcmRlckF4aXMoY2hpbGQsIGNyb3NzQXhpcylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFsaWduSXRlbSAhPT0gQ1NTX0FMSUdOX0ZMRVhfU1RBUlQpIHtcbiAgICAgICAgICAgICAgLy8gVGhlIHJlbWFpbmluZyBzcGFjZSBiZXR3ZWVuIHRoZSBwYXJlbnQgZGltZW5zaW9ucytwYWRkaW5nIGFuZCBjaGlsZFxuICAgICAgICAgICAgICAvLyBkaW1lbnNpb25zK21hcmdpbi5cbiAgICAgICAgICAgICAgdmFyLypmbG9hdCovIHJlbWFpbmluZ0Nyb3NzRGltID0gY29udGFpbmVyQ3Jvc3NBeGlzIC1cbiAgICAgICAgICAgICAgICBwYWRkaW5nQW5kQm9yZGVyQXhpc0Nyb3NzIC0gZ2V0RGltV2l0aE1hcmdpbihjaGlsZCwgY3Jvc3NBeGlzKTtcblxuICAgICAgICAgICAgICBpZiAoYWxpZ25JdGVtID09PSBDU1NfQUxJR05fQ0VOVEVSKSB7XG4gICAgICAgICAgICAgICAgbGVhZGluZ0Nyb3NzRGltICs9IHJlbWFpbmluZ0Nyb3NzRGltIC8gMjtcbiAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gQ1NTX0FMSUdOX0ZMRVhfRU5EXG4gICAgICAgICAgICAgICAgbGVhZGluZ0Nyb3NzRGltICs9IHJlbWFpbmluZ0Nyb3NzRGltO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQW5kIHdlIGFwcGx5IHRoZSBwb3NpdGlvblxuICAgICAgICAgIGNoaWxkLmxheW91dFtwb3NbY3Jvc3NBeGlzXV0gKz0gbGluZXNDcm9zc0RpbSArIGxlYWRpbmdDcm9zc0RpbTtcblxuICAgICAgICAgIC8vIERlZmluZSB0aGUgdHJhaWxpbmcgcG9zaXRpb24gYWNjb3JkaW5nbHkuXG4gICAgICAgICAgaWYgKGlzQ3Jvc3NEaW1EZWZpbmVkKSB7XG4gICAgICAgICAgICBzZXRUcmFpbGluZ1Bvc2l0aW9uKG5vZGUsIGNoaWxkLCBjcm9zc0F4aXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsaW5lc0Nyb3NzRGltICs9IGNyb3NzRGltO1xuICAgICAgbGluZXNNYWluRGltID0gZm1heGYobGluZXNNYWluRGltLCBtYWluRGltKTtcbiAgICAgIGxpbmVzQ291bnQgKz0gMTtcbiAgICAgIHN0YXJ0TGluZSA9IGVuZExpbmU7XG4gICAgfVxuXG4gICAgLy8gPExvb3AgRT5cbiAgICAvL1xuICAgIC8vIE5vdGUocHJlbmF1eCk6IE1vcmUgdGhhbiBvbmUgbGluZSwgd2UgbmVlZCB0byBsYXlvdXQgdGhlIGNyb3NzQXhpc1xuICAgIC8vIGFjY29yZGluZyB0byBhbGlnbkNvbnRlbnQuXG4gICAgLy9cbiAgICAvLyBOb3RlIHRoYXQgd2UgY291bGQgcHJvYmFibHkgcmVtb3ZlIDxMb29wIEQ+IGFuZCBoYW5kbGUgdGhlIG9uZSBsaW5lIGNhc2VcbiAgICAvLyBoZXJlIHRvbywgYnV0IGZvciB0aGUgbW9tZW50IHRoaXMgaXMgc2FmZXIgc2luY2UgaXQgd29uJ3QgaW50ZXJmZXJlIHdpdGhcbiAgICAvLyBwcmV2aW91c2x5IHdvcmtpbmcgY29kZS5cbiAgICAvL1xuICAgIC8vIFNlZSBzcGVjczpcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi8yMDEyL0NSLWNzczMtZmxleGJveC0yMDEyMDkxOC8jbGF5b3V0LWFsZ29yaXRobVxuICAgIC8vIHNlY3Rpb24gOS40XG4gICAgLy9cbiAgICBpZiAobGluZXNDb3VudCA+IDEgJiYgaXNDcm9zc0RpbURlZmluZWQpIHtcbiAgICAgIHZhci8qZmxvYXQqLyBub2RlQ3Jvc3NBeGlzSW5uZXJTaXplID0gbm9kZS5sYXlvdXRbZGltW2Nyb3NzQXhpc11dIC1cbiAgICAgICAgICBwYWRkaW5nQW5kQm9yZGVyQXhpc0Nyb3NzO1xuICAgICAgdmFyLypmbG9hdCovIHJlbWFpbmluZ0FsaWduQ29udGVudERpbSA9IG5vZGVDcm9zc0F4aXNJbm5lclNpemUgLSBsaW5lc0Nyb3NzRGltO1xuXG4gICAgICB2YXIvKmZsb2F0Ki8gY3Jvc3NEaW1MZWFkID0gMDtcbiAgICAgIHZhci8qZmxvYXQqLyBjdXJyZW50TGVhZCA9IGxlYWRpbmdQYWRkaW5nQW5kQm9yZGVyQ3Jvc3M7XG5cbiAgICAgIHZhci8qY3NzX2FsaWduX3QqLyBhbGlnbkNvbnRlbnQgPSBnZXRBbGlnbkNvbnRlbnQobm9kZSk7XG4gICAgICBpZiAoYWxpZ25Db250ZW50ID09PSBDU1NfQUxJR05fRkxFWF9FTkQpIHtcbiAgICAgICAgY3VycmVudExlYWQgKz0gcmVtYWluaW5nQWxpZ25Db250ZW50RGltO1xuICAgICAgfSBlbHNlIGlmIChhbGlnbkNvbnRlbnQgPT09IENTU19BTElHTl9DRU5URVIpIHtcbiAgICAgICAgY3VycmVudExlYWQgKz0gcmVtYWluaW5nQWxpZ25Db250ZW50RGltIC8gMjtcbiAgICAgIH0gZWxzZSBpZiAoYWxpZ25Db250ZW50ID09PSBDU1NfQUxJR05fU1RSRVRDSCkge1xuICAgICAgICBpZiAobm9kZUNyb3NzQXhpc0lubmVyU2l6ZSA+IGxpbmVzQ3Jvc3NEaW0pIHtcbiAgICAgICAgICBjcm9zc0RpbUxlYWQgPSAocmVtYWluaW5nQWxpZ25Db250ZW50RGltIC8gbGluZXNDb3VudCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyLyppbnQqLyBlbmRJbmRleCA9IDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGluZXNDb3VudDsgKytpKSB7XG4gICAgICAgIHZhci8qaW50Ki8gc3RhcnRJbmRleCA9IGVuZEluZGV4O1xuXG4gICAgICAgIC8vIGNvbXB1dGUgdGhlIGxpbmUncyBoZWlnaHQgYW5kIGZpbmQgdGhlIGVuZEluZGV4XG4gICAgICAgIHZhci8qZmxvYXQqLyBsaW5lSGVpZ2h0ID0gMDtcbiAgICAgICAgZm9yIChpaSA9IHN0YXJ0SW5kZXg7IGlpIDwgY2hpbGRDb3VudDsgKytpaSkge1xuICAgICAgICAgIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpaV07XG4gICAgICAgICAgaWYgKGdldFBvc2l0aW9uVHlwZShjaGlsZCkgIT09IENTU19QT1NJVElPTl9SRUxBVElWRSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGlsZC5saW5lSW5kZXggIT09IGkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWlzVW5kZWZpbmVkKGNoaWxkLmxheW91dFtkaW1bY3Jvc3NBeGlzXV0pKSB7XG4gICAgICAgICAgICBsaW5lSGVpZ2h0ID0gZm1heGYoXG4gICAgICAgICAgICAgIGxpbmVIZWlnaHQsXG4gICAgICAgICAgICAgIGNoaWxkLmxheW91dFtkaW1bY3Jvc3NBeGlzXV0gKyBnZXRNYXJnaW5BeGlzKGNoaWxkLCBjcm9zc0F4aXMpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbmRJbmRleCA9IGlpO1xuICAgICAgICBsaW5lSGVpZ2h0ICs9IGNyb3NzRGltTGVhZDtcblxuICAgICAgICBmb3IgKGlpID0gc3RhcnRJbmRleDsgaWkgPCBlbmRJbmRleDsgKytpaSkge1xuICAgICAgICAgIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpaV07XG4gICAgICAgICAgaWYgKGdldFBvc2l0aW9uVHlwZShjaGlsZCkgIT09IENTU19QT1NJVElPTl9SRUxBVElWRSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyLypjc3NfYWxpZ25fdCovIGFsaWduQ29udGVudEFsaWduSXRlbSA9IGdldEFsaWduSXRlbShub2RlLCBjaGlsZCk7XG4gICAgICAgICAgaWYgKGFsaWduQ29udGVudEFsaWduSXRlbSA9PT0gQ1NTX0FMSUdOX0ZMRVhfU1RBUlQpIHtcbiAgICAgICAgICAgIGNoaWxkLmxheW91dFtwb3NbY3Jvc3NBeGlzXV0gPSBjdXJyZW50TGVhZCArIGdldExlYWRpbmdNYXJnaW4oY2hpbGQsIGNyb3NzQXhpcyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChhbGlnbkNvbnRlbnRBbGlnbkl0ZW0gPT09IENTU19BTElHTl9GTEVYX0VORCkge1xuICAgICAgICAgICAgY2hpbGQubGF5b3V0W3Bvc1tjcm9zc0F4aXNdXSA9IGN1cnJlbnRMZWFkICsgbGluZUhlaWdodCAtIGdldFRyYWlsaW5nTWFyZ2luKGNoaWxkLCBjcm9zc0F4aXMpIC0gY2hpbGQubGF5b3V0W2RpbVtjcm9zc0F4aXNdXTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFsaWduQ29udGVudEFsaWduSXRlbSA9PT0gQ1NTX0FMSUdOX0NFTlRFUikge1xuICAgICAgICAgICAgdmFyLypmbG9hdCovIGNoaWxkSGVpZ2h0ID0gY2hpbGQubGF5b3V0W2RpbVtjcm9zc0F4aXNdXTtcbiAgICAgICAgICAgIGNoaWxkLmxheW91dFtwb3NbY3Jvc3NBeGlzXV0gPSBjdXJyZW50TGVhZCArIChsaW5lSGVpZ2h0IC0gY2hpbGRIZWlnaHQpIC8gMjtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFsaWduQ29udGVudEFsaWduSXRlbSA9PT0gQ1NTX0FMSUdOX1NUUkVUQ0gpIHtcbiAgICAgICAgICAgIGNoaWxkLmxheW91dFtwb3NbY3Jvc3NBeGlzXV0gPSBjdXJyZW50TGVhZCArIGdldExlYWRpbmdNYXJnaW4oY2hpbGQsIGNyb3NzQXhpcyk7XG4gICAgICAgICAgICAvLyBUT0RPKHByZW5hdXgpOiBDb3JyZWN0bHkgc2V0IHRoZSBoZWlnaHQgb2YgaXRlbXMgd2l0aCB1bmRlZmluZWRcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIChhdXRvKSBjcm9zc0F4aXMgZGltZW5zaW9uLlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRMZWFkICs9IGxpbmVIZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyLypib29sKi8gbmVlZHNNYWluVHJhaWxpbmdQb3MgPSBmYWxzZTtcbiAgICB2YXIvKmJvb2wqLyBuZWVkc0Nyb3NzVHJhaWxpbmdQb3MgPSBmYWxzZTtcblxuICAgIC8vIElmIHRoZSB1c2VyIGRpZG4ndCBzcGVjaWZ5IGEgd2lkdGggb3IgaGVpZ2h0LCBhbmQgaXQgaGFzIG5vdCBiZWVuIHNldFxuICAgIC8vIGJ5IHRoZSBjb250YWluZXIsIHRoZW4gd2Ugc2V0IGl0IHZpYSB0aGUgY2hpbGRyZW4uXG4gICAgaWYgKCFpc01haW5EaW1EZWZpbmVkKSB7XG4gICAgICBub2RlLmxheW91dFtkaW1bbWFpbkF4aXNdXSA9IGZtYXhmKFxuICAgICAgICAvLyBXZSdyZSBtaXNzaW5nIHRoZSBsYXN0IHBhZGRpbmcgYXQgdGhpcyBwb2ludCB0byBnZXQgdGhlIGZpbmFsXG4gICAgICAgIC8vIGRpbWVuc2lvblxuICAgICAgICBib3VuZEF4aXMobm9kZSwgbWFpbkF4aXMsIGxpbmVzTWFpbkRpbSArIGdldFRyYWlsaW5nUGFkZGluZ0FuZEJvcmRlcihub2RlLCBtYWluQXhpcykpLFxuICAgICAgICAvLyBXZSBjYW4gbmV2ZXIgYXNzaWduIGEgd2lkdGggc21hbGxlciB0aGFuIHRoZSBwYWRkaW5nIGFuZCBib3JkZXJzXG4gICAgICAgIHBhZGRpbmdBbmRCb3JkZXJBeGlzTWFpblxuICAgICAgKTtcblxuICAgICAgaWYgKG1haW5BeGlzID09PSBDU1NfRkxFWF9ESVJFQ1RJT05fUk9XX1JFVkVSU0UgfHxcbiAgICAgICAgICBtYWluQXhpcyA9PT0gQ1NTX0ZMRVhfRElSRUNUSU9OX0NPTFVNTl9SRVZFUlNFKSB7XG4gICAgICAgIG5lZWRzTWFpblRyYWlsaW5nUG9zID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWlzQ3Jvc3NEaW1EZWZpbmVkKSB7XG4gICAgICBub2RlLmxheW91dFtkaW1bY3Jvc3NBeGlzXV0gPSBmbWF4ZihcbiAgICAgICAgLy8gRm9yIHRoZSBjcm9zcyBkaW0sIHdlIGFkZCBib3RoIHNpZGVzIGF0IHRoZSBlbmQgYmVjYXVzZSB0aGUgdmFsdWVcbiAgICAgICAgLy8gaXMgYWdncmVnYXRlIHZpYSBhIG1heCBmdW5jdGlvbi4gSW50ZXJtZWRpYXRlIG5lZ2F0aXZlIHZhbHVlc1xuICAgICAgICAvLyBjYW4gbWVzcyB0aGlzIGNvbXB1dGF0aW9uIG90aGVyd2lzZVxuICAgICAgICBib3VuZEF4aXMobm9kZSwgY3Jvc3NBeGlzLCBsaW5lc0Nyb3NzRGltICsgcGFkZGluZ0FuZEJvcmRlckF4aXNDcm9zcyksXG4gICAgICAgIHBhZGRpbmdBbmRCb3JkZXJBeGlzQ3Jvc3NcbiAgICAgICk7XG5cbiAgICAgIGlmIChjcm9zc0F4aXMgPT09IENTU19GTEVYX0RJUkVDVElPTl9ST1dfUkVWRVJTRSB8fFxuICAgICAgICAgIGNyb3NzQXhpcyA9PT0gQ1NTX0ZMRVhfRElSRUNUSU9OX0NPTFVNTl9SRVZFUlNFKSB7XG4gICAgICAgIG5lZWRzQ3Jvc3NUcmFpbGluZ1BvcyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gPExvb3AgRj4gU2V0IHRyYWlsaW5nIHBvc2l0aW9uIGlmIG5lY2Vzc2FyeVxuICAgIGlmIChuZWVkc01haW5UcmFpbGluZ1BvcyB8fCBuZWVkc0Nyb3NzVHJhaWxpbmdQb3MpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZENvdW50OyArK2kpIHtcbiAgICAgICAgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuXG4gICAgICAgIGlmIChuZWVkc01haW5UcmFpbGluZ1Bvcykge1xuICAgICAgICAgIHNldFRyYWlsaW5nUG9zaXRpb24obm9kZSwgY2hpbGQsIG1haW5BeGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZWVkc0Nyb3NzVHJhaWxpbmdQb3MpIHtcbiAgICAgICAgICBzZXRUcmFpbGluZ1Bvc2l0aW9uKG5vZGUsIGNoaWxkLCBjcm9zc0F4aXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gPExvb3AgRz4gQ2FsY3VsYXRlIGRpbWVuc2lvbnMgZm9yIGFic29sdXRlbHkgcG9zaXRpb25lZCBlbGVtZW50c1xuICAgIGN1cnJlbnRBYnNvbHV0ZUNoaWxkID0gZmlyc3RBYnNvbHV0ZUNoaWxkO1xuICAgIHdoaWxlIChjdXJyZW50QWJzb2x1dGVDaGlsZCAhPT0gbnVsbCkge1xuICAgICAgLy8gUHJlLWZpbGwgZGltZW5zaW9ucyB3aGVuIHVzaW5nIGFic29sdXRlIHBvc2l0aW9uIGFuZCBib3RoIG9mZnNldHMgZm9yXG4gICAgICAvLyB0aGUgYXhpcyBhcmUgZGVmaW5lZCAoZWl0aGVyIGJvdGggbGVmdCBhbmQgcmlnaHQgb3IgdG9wIGFuZCBib3R0b20pLlxuICAgICAgZm9yIChpaSA9IDA7IGlpIDwgMjsgaWkrKykge1xuICAgICAgICBheGlzID0gKGlpICE9PSAwKSA/IENTU19GTEVYX0RJUkVDVElPTl9ST1cgOiBDU1NfRkxFWF9ESVJFQ1RJT05fQ09MVU1OO1xuXG4gICAgICAgIGlmICghaXNVbmRlZmluZWQobm9kZS5sYXlvdXRbZGltW2F4aXNdXSkgJiZcbiAgICAgICAgICAgICFpc0RpbURlZmluZWQoY3VycmVudEFic29sdXRlQ2hpbGQsIGF4aXMpICYmXG4gICAgICAgICAgICBpc1Bvc0RlZmluZWQoY3VycmVudEFic29sdXRlQ2hpbGQsIGxlYWRpbmdbYXhpc10pICYmXG4gICAgICAgICAgICBpc1Bvc0RlZmluZWQoY3VycmVudEFic29sdXRlQ2hpbGQsIHRyYWlsaW5nW2F4aXNdKSkge1xuICAgICAgICAgIGN1cnJlbnRBYnNvbHV0ZUNoaWxkLmxheW91dFtkaW1bYXhpc11dID0gZm1heGYoXG4gICAgICAgICAgICBib3VuZEF4aXMoY3VycmVudEFic29sdXRlQ2hpbGQsIGF4aXMsIG5vZGUubGF5b3V0W2RpbVtheGlzXV0gLVxuICAgICAgICAgICAgICBnZXRCb3JkZXJBeGlzKG5vZGUsIGF4aXMpIC1cbiAgICAgICAgICAgICAgZ2V0TWFyZ2luQXhpcyhjdXJyZW50QWJzb2x1dGVDaGlsZCwgYXhpcykgLVxuICAgICAgICAgICAgICBnZXRQb3NpdGlvbihjdXJyZW50QWJzb2x1dGVDaGlsZCwgbGVhZGluZ1theGlzXSkgLVxuICAgICAgICAgICAgICBnZXRQb3NpdGlvbihjdXJyZW50QWJzb2x1dGVDaGlsZCwgdHJhaWxpbmdbYXhpc10pXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgLy8gWW91IG5ldmVyIHdhbnQgdG8gZ28gc21hbGxlciB0aGFuIHBhZGRpbmdcbiAgICAgICAgICAgIGdldFBhZGRpbmdBbmRCb3JkZXJBeGlzKGN1cnJlbnRBYnNvbHV0ZUNoaWxkLCBheGlzKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNQb3NEZWZpbmVkKGN1cnJlbnRBYnNvbHV0ZUNoaWxkLCB0cmFpbGluZ1theGlzXSkgJiZcbiAgICAgICAgICAgICFpc1Bvc0RlZmluZWQoY3VycmVudEFic29sdXRlQ2hpbGQsIGxlYWRpbmdbYXhpc10pKSB7XG4gICAgICAgICAgY3VycmVudEFic29sdXRlQ2hpbGQubGF5b3V0W2xlYWRpbmdbYXhpc11dID1cbiAgICAgICAgICAgIG5vZGUubGF5b3V0W2RpbVtheGlzXV0gLVxuICAgICAgICAgICAgY3VycmVudEFic29sdXRlQ2hpbGQubGF5b3V0W2RpbVtheGlzXV0gLVxuICAgICAgICAgICAgZ2V0UG9zaXRpb24oY3VycmVudEFic29sdXRlQ2hpbGQsIHRyYWlsaW5nW2F4aXNdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjaGlsZCA9IGN1cnJlbnRBYnNvbHV0ZUNoaWxkO1xuICAgICAgY3VycmVudEFic29sdXRlQ2hpbGQgPSBjdXJyZW50QWJzb2x1dGVDaGlsZC5uZXh0QWJzb2x1dGVDaGlsZDtcbiAgICAgIGNoaWxkLm5leHRBYnNvbHV0ZUNoaWxkID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBsYXlvdXROb2RlKG5vZGUsIHBhcmVudE1heFdpZHRoLCBwYXJlbnREaXJlY3Rpb24pIHtcbiAgICBub2RlLnNob3VsZFVwZGF0ZSA9IHRydWU7XG5cbiAgICB2YXIgZGlyZWN0aW9uID0gbm9kZS5zdHlsZS5kaXJlY3Rpb24gfHwgQ1NTX0RJUkVDVElPTl9MVFI7XG4gICAgdmFyIHNraXBMYXlvdXQgPVxuICAgICAgIW5vZGUuaXNEaXJ0eSAmJlxuICAgICAgbm9kZS5sYXN0TGF5b3V0ICYmXG4gICAgICBub2RlLmxhc3RMYXlvdXQucmVxdWVzdGVkSGVpZ2h0ID09PSBub2RlLmxheW91dC5oZWlnaHQgJiZcbiAgICAgIG5vZGUubGFzdExheW91dC5yZXF1ZXN0ZWRXaWR0aCA9PT0gbm9kZS5sYXlvdXQud2lkdGggJiZcbiAgICAgIG5vZGUubGFzdExheW91dC5wYXJlbnRNYXhXaWR0aCA9PT0gcGFyZW50TWF4V2lkdGggJiZcbiAgICAgIG5vZGUubGFzdExheW91dC5kaXJlY3Rpb24gPT09IGRpcmVjdGlvbjtcblxuICAgIGlmIChza2lwTGF5b3V0KSB7XG4gICAgICBub2RlLmxheW91dC53aWR0aCA9IG5vZGUubGFzdExheW91dC53aWR0aDtcbiAgICAgIG5vZGUubGF5b3V0LmhlaWdodCA9IG5vZGUubGFzdExheW91dC5oZWlnaHQ7XG4gICAgICBub2RlLmxheW91dC50b3AgPSBub2RlLmxhc3RMYXlvdXQudG9wO1xuICAgICAgbm9kZS5sYXlvdXQubGVmdCA9IG5vZGUubGFzdExheW91dC5sZWZ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIW5vZGUubGFzdExheW91dCkge1xuICAgICAgICBub2RlLmxhc3RMYXlvdXQgPSB7fTtcbiAgICAgIH1cblxuICAgICAgbm9kZS5sYXN0TGF5b3V0LnJlcXVlc3RlZFdpZHRoID0gbm9kZS5sYXlvdXQud2lkdGg7XG4gICAgICBub2RlLmxhc3RMYXlvdXQucmVxdWVzdGVkSGVpZ2h0ID0gbm9kZS5sYXlvdXQuaGVpZ2h0O1xuICAgICAgbm9kZS5sYXN0TGF5b3V0LnBhcmVudE1heFdpZHRoID0gcGFyZW50TWF4V2lkdGg7XG4gICAgICBub2RlLmxhc3RMYXlvdXQuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuXG4gICAgICAvLyBSZXNldCBjaGlsZCBsYXlvdXRzXG4gICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgY2hpbGQubGF5b3V0LndpZHRoID0gdW5kZWZpbmVkO1xuICAgICAgICBjaGlsZC5sYXlvdXQuaGVpZ2h0ID0gdW5kZWZpbmVkO1xuICAgICAgICBjaGlsZC5sYXlvdXQudG9wID0gMDtcbiAgICAgICAgY2hpbGQubGF5b3V0LmxlZnQgPSAwO1xuICAgICAgfSk7XG5cbiAgICAgIGxheW91dE5vZGVJbXBsKG5vZGUsIHBhcmVudE1heFdpZHRoLCBwYXJlbnREaXJlY3Rpb24pO1xuXG4gICAgICBub2RlLmxhc3RMYXlvdXQud2lkdGggPSBub2RlLmxheW91dC53aWR0aDtcbiAgICAgIG5vZGUubGFzdExheW91dC5oZWlnaHQgPSBub2RlLmxheW91dC5oZWlnaHQ7XG4gICAgICBub2RlLmxhc3RMYXlvdXQudG9wID0gbm9kZS5sYXlvdXQudG9wO1xuICAgICAgbm9kZS5sYXN0TGF5b3V0LmxlZnQgPSBub2RlLmxheW91dC5sZWZ0O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbGF5b3V0Tm9kZUltcGw6IGxheW91dE5vZGVJbXBsLFxuICAgIGNvbXB1dGVMYXlvdXQ6IGxheW91dE5vZGUsXG4gICAgZmlsbE5vZGVzOiBmaWxsTm9kZXNcbiAgfTtcbn0pKCk7XG5cbi8vIFRoaXMgbW9kdWxlIGV4cG9ydCBpcyBvbmx5IHVzZWQgZm9yIHRoZSBwdXJwb3NlcyBvZiB1bml0IHRlc3RpbmcgdGhpcyBmaWxlLiBXaGVuXG4vLyB0aGUgbGlicmFyeSBpcyBwYWNrYWdlZCB0aGlzIGZpbGUgaXMgaW5jbHVkZWQgd2l0aGluIGNzcy1sYXlvdXQuanMgd2hpY2ggZm9ybXNcbi8vIHRoZSBwdWJsaWMgQVBJLlxuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGNvbXB1dGVMYXlvdXQ7XG59XG5cblxuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIC8qZXNsaW50LWRpc2FibGUgKi9cbiAgICAvLyBkaXNhYmxpbmcgRVNMaW50IGJlY2F1c2UgdGhpcyBjb2RlIHJlbGllcyBvbiB0aGUgYWJvdmUgaW5jbHVkZVxuICAgIGNvbXB1dGVMYXlvdXQuZmlsbE5vZGVzKG5vZGUpO1xuICAgIGNvbXB1dGVMYXlvdXQuY29tcHV0ZUxheW91dChub2RlKTtcbiAgICAvKmVzbGludC1lbmFibGUgKi9cbiAgfTtcbn0pKTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS4xMC4wXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBGbGV4ZXIsIGNvbXB1dGVMYXlvdXQsIGZuLCBqLCBsYXlvdXRQcm9wLCBsZW4sIHJlZixcbiAgICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gICAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4gIGNvbXB1dGVMYXlvdXQgPSByZXF1aXJlKFwiY3NzLWxheW91dFwiKTtcblxuICBGbGV4ZXIgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICAgIGV4dGVuZChGbGV4ZXIsIHN1cGVyQ2xhc3MpO1xuXG4gICAgRmxleGVyLmxheW91dFByb3BzID0gW1wiZml4ZWRXaWR0aFwiLCBcImZpeGVkSGVpZ2h0XCIsIFwibWluV2lkdGhcIiwgXCJtaW5IZWlnaHRcIiwgXCJtYXhXaWR0aFwiLCBcIm1heEhlaWdodFwiLCBcImxlZnRcIiwgXCJyaWdodFwiLCBcInRvcFwiLCBcImJvdHRvbVwiLCBcIm1hcmdpblwiLCBcIm1hcmdpbkxlZnRcIiwgXCJtYXJnaW5SaWdodFwiLCBcIm1hcmdpblRvcFwiLCBcIm1hcmdpbkJvdHRvbVwiLCBcInBhZGRpbmdcIiwgXCJwYWRkaW5nTGVmdFwiLCBcInBhZGRpbmdSaWdodFwiLCBcInBhZGRpbmdUb3BcIiwgXCJwYWRkaW5nQm90dG9tXCIsIFwiYm9yZGVyTGVmdFdpZHRoXCIsIFwiYm9yZGVyUmlnaHRXaWR0aFwiLCBcImJvcmRlclRvcFdpZHRoXCIsIFwiYm9yZGVyQm90dG9tV2lkdGhcIiwgXCJmbGV4RGlyZWN0aW9uXCIsIFwianVzdGlmeUNvbnRlbnRcIiwgXCJhbGlnbkl0ZW1zXCIsIFwiYWxpZ25TZWxmXCIsIFwiZmxleFwiLCBcImZsZXhXcmFwXCIsIFwicG9zaXRpb25cIl07XG5cbiAgICBGbGV4ZXIucHJvdG90eXBlLmN1cnZlID0gdm9pZCAwO1xuXG4gICAgZnVuY3Rpb24gRmxleGVyKGxheWVyKSB7XG4gICAgICB2YXIgcHJvcGVydHk7XG4gICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG4gICAgICB0aGlzLl9kcmF3SWZOZWVkZWQgPSBiaW5kKHRoaXMuX2RyYXdJZk5lZWRlZCwgdGhpcyk7XG4gICAgICB0aGlzLl9zZXROZWVkc1VwZGF0ZSA9IGJpbmQodGhpcy5fc2V0TmVlZHNVcGRhdGUsIHRoaXMpO1xuICAgICAgdGhpcy5fdXBkYXRlVHJlZSA9IGJpbmQodGhpcy5fdXBkYXRlVHJlZSwgdGhpcyk7XG4gICAgICB0aGlzLl9kaWRSZXNpemUgPSBiaW5kKHRoaXMuX2RpZFJlc2l6ZSwgdGhpcyk7XG4gICAgICB0aGlzLmxheWVyLm9uKFwiY2hhbmdlOnN1YkxheWVyc1wiLCB0aGlzLl91cGRhdGVUcmVlKTtcbiAgICAgIEZyYW1lci5Mb29wLm9uKFwidXBkYXRlXCIsIHRoaXMuX2RyYXdJZk5lZWRlZCk7XG4gICAgICB0aGlzLmxheWVyLl9jb250ZXh0LmRvbUV2ZW50TWFuYWdlci53cmFwKHdpbmRvdykuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLl9kaWRSZXNpemUpO1xuICAgICAgdGhpcy5fbGF5b3V0Tm9kZSA9IHtcbiAgICAgICAgc3R5bGU6IHt9LFxuICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgIH07XG4gICAgICBmb3IgKHByb3BlcnR5IGluIEZsZXhlci5sYXlvdXRQcm9wcykge1xuICAgICAgICBpZiAodGhpcy5sYXllcltwcm9wZXJ0eV0pIHtcbiAgICAgICAgICB0aGlzLl9sYXlvdXROb2RlLnN0eWxlW3RoaXMuX2dldExheW91dFByb3BlcnR5KHByb3BlcnR5KV0gPSB0aGlzLmxheWVyW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIEZsZXhlci5wcm90b3R5cGUuX2RpZFJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmxheWVyLnN1cGVyTGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldE5lZWRzVXBkYXRlKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIEZsZXhlci5wcm90b3R5cGUuX2dldExheW91dFByb3BlcnR5ID0gZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAgIHZhciBjc3NMYXlvdXRQcm9wZXJ0eTtcbiAgICAgIGNzc0xheW91dFByb3BlcnR5ID0gcHJvcGVydHk7XG4gICAgICBpZiAoY3NzTGF5b3V0UHJvcGVydHkgPT09IFwiZml4ZWRXaWR0aFwiKSB7XG4gICAgICAgIGNzc0xheW91dFByb3BlcnR5ID0gXCJ3aWR0aFwiO1xuICAgICAgfVxuICAgICAgaWYgKGNzc0xheW91dFByb3BlcnR5ID09PSBcImZpeGVkSGVpZ2h0XCIpIHtcbiAgICAgICAgY3NzTGF5b3V0UHJvcGVydHkgPSBcImhlaWdodFwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNzc0xheW91dFByb3BlcnR5O1xuICAgIH07XG5cbiAgICBGbGV4ZXIucHJvdG90eXBlLnVwZGF0ZVByb3BlcnR5ID0gZnVuY3Rpb24ocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBpZiAocHJvcGVydHkpIHtcbiAgICAgICAgdGhpcy5fbGF5b3V0Tm9kZS5zdHlsZVt0aGlzLl9nZXRMYXlvdXRQcm9wZXJ0eShwcm9wZXJ0eSldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fc2V0TmVlZHNVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgRmxleGVyLnByb3RvdHlwZS5fdXBkYXRlVHJlZSA9IGZ1bmN0aW9uKGxheWVyc0NoYW5nZWQpIHtcbiAgICAgIHZhciBqLCBrLCBsYXllckFkZGVkLCBsYXllclJlbW92ZWQsIGxlbiwgbGVuMSwgcmVmLCByZWYxO1xuICAgICAgcmVmID0gbGF5ZXJzQ2hhbmdlZC5hZGRlZDtcbiAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBsYXllckFkZGVkID0gcmVmW2pdO1xuICAgICAgICB0aGlzLl9sYXlvdXROb2RlLmNoaWxkcmVuLnB1c2gobGF5ZXJBZGRlZC5sYXlvdXQuX2xheW91dE5vZGUpO1xuICAgICAgfVxuICAgICAgcmVmMSA9IGxheWVyc0NoYW5nZWQucmVtb3ZlZDtcbiAgICAgIGZvciAoayA9IDAsIGxlbjEgPSByZWYxLmxlbmd0aDsgayA8IGxlbjE7IGsrKykge1xuICAgICAgICBsYXllclJlbW92ZWQgPSByZWYxW2tdO1xuICAgICAgICB0aGlzLl9sYXlvdXROb2RlLmNoaWxkcmVuLnNwbGljZShfbGF5b3V0Tm9kZS5pbmRleE9mKGxheWVyUmVtb3ZlZC5sYXlvdXQuX2xheW91dE5vZGUpLCAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9zZXROZWVkc1VwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBGbGV4ZXIucHJvdG90eXBlLl9zZXROZWVkc1VwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJvb3RMYXllcjtcbiAgICAgIHJvb3RMYXllciA9IHRoaXMubGF5ZXI7XG4gICAgICB3aGlsZSAocm9vdExheWVyLnN1cGVyTGF5ZXIpIHtcbiAgICAgICAgcm9vdExheWVyID0gcm9vdExheWVyLnN1cGVyTGF5ZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gcm9vdExheWVyLmxheW91dC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfTtcblxuICAgIEZsZXhlci5wcm90b3R5cGUuX2RyYXdJZk5lZWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5ld1RyZWUsIHJvb3RMYXlvdXROb2RlO1xuICAgICAgaWYgKCF0aGlzLmxheWVyLnN1cGVyTGF5ZXIgJiYgdGhpcy5uZWVkc1VwZGF0ZSkge1xuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIHJvb3RMYXlvdXROb2RlID0ge1xuICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICB3aWR0aDogU2NyZWVuLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBTY3JlZW4uaGVpZ2h0XG4gICAgICAgICAgfSxcbiAgICAgICAgICBjaGlsZHJlbjogW3RoaXMuX2xheW91dE5vZGVdXG4gICAgICAgIH07XG4gICAgICAgIG5ld1RyZWUgPSBGcmFtZXIuXy5jbG9uZURlZXAocm9vdExheW91dE5vZGUpO1xuICAgICAgICBjb21wdXRlTGF5b3V0KG5ld1RyZWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5fdXBkYXRlTGF5ZXIobmV3VHJlZS5jaGlsZHJlblswXSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIEZsZXhlci5wcm90b3R5cGUuX3VwZGF0ZUxheWVyID0gZnVuY3Rpb24oY29tcHV0ZWRUcmVlKSB7XG4gICAgICB2YXIgZnJhbWUsIGksIGosIGxlbiwgcmVmLCByZXN1bHRzLCBzdWJMYXllcjtcbiAgICAgIGlmIChjb21wdXRlZFRyZWUuc2hvdWxkVXBkYXRlKSB7XG4gICAgICAgIGlmICghdGhpcy5jdXJ2ZSkge1xuICAgICAgICAgIGZyYW1lID0ge1xuICAgICAgICAgICAgeDogY29tcHV0ZWRUcmVlLmxheW91dC5sZWZ0LFxuICAgICAgICAgICAgeTogY29tcHV0ZWRUcmVlLmxheW91dC50b3AsXG4gICAgICAgICAgICB3aWR0aDogY29tcHV0ZWRUcmVlLmxheW91dC53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogY29tcHV0ZWRUcmVlLmxheW91dC5oZWlnaHRcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMubGF5ZXIuZnJhbWUgPSBmcmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxheWVyLmFuaW1hdGUoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICB4OiBjb21wdXRlZFRyZWUubGF5b3V0LmxlZnQsXG4gICAgICAgICAgICAgIHk6IGNvbXB1dGVkVHJlZS5sYXlvdXQudG9wLFxuICAgICAgICAgICAgICB3aWR0aDogY29tcHV0ZWRUcmVlLmxheW91dC53aWR0aCxcbiAgICAgICAgICAgICAgaGVpZ2h0OiBjb21wdXRlZFRyZWUubGF5b3V0LmhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGN1cnZlOiB0aGlzLmN1cnZlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlZiA9IHRoaXMubGF5ZXIuc3ViTGF5ZXJzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGkgPSArK2opIHtcbiAgICAgICAgc3ViTGF5ZXIgPSByZWZbaV07XG4gICAgICAgIGlmIChjb21wdXRlZFRyZWUuY2hpbGRyZW4gJiYgY29tcHV0ZWRUcmVlLmNoaWxkcmVuLmxlbmd0aCA+IGkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goc3ViTGF5ZXIubGF5b3V0Ll91cGRhdGVMYXllcihjb21wdXRlZFRyZWUuY2hpbGRyZW5baV0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIHJldHVybiBGbGV4ZXI7XG5cbiAgfSkoRnJhbWVyLkV2ZW50RW1pdHRlcik7XG5cbiAgTGF5ZXIuZGVmaW5lKFwibGF5b3V0XCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX2xheW91dCA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2xheW91dCA9IG5ldyBGbGV4ZXIodGhpcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fbGF5b3V0O1xuICAgIH1cbiAgfSk7XG5cbiAgcmVmID0gRmxleGVyLmxheW91dFByb3BzO1xuICBmbiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbihsYXlvdXRQcm9wKSB7XG4gICAgICByZXR1cm4gTGF5ZXIuZGVmaW5lKGxheW91dFByb3AsIHtcbiAgICAgICAgXCJkZWZhdWx0XCI6IHZvaWQgMCxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHlWYWx1ZShsYXlvdXRQcm9wKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5VmFsdWUobGF5b3V0UHJvcCwgdmFsdWUpO1xuICAgICAgICAgIHJldHVybiB0aGlzLmxheW91dC51cGRhdGVQcm9wZXJ0eShsYXlvdXRQcm9wLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH0pKHRoaXMpO1xuICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICBsYXlvdXRQcm9wID0gcmVmW2pdO1xuICAgIGZuKGxheW91dFByb3ApO1xuICB9XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBGbGV4ZXI7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJleHBvcnRzLkZsZXhlciA9IHJlcXVpcmUgXCJmbGV4ZXJcIiJdfQ==
