"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BubbleChart = undefined;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BubbleChart = exports.BubbleChart = function BubbleChart(_ref) {
  var graph = _ref.graph,
      data = _ref.data,
      bubbleClickFun = _ref.bubbleClickFun,
      valueFont = _ref.valueFont,
      labelFont = _ref.labelFont,
      legendClickFun = _ref.legendClickFun,
      legendFont = _ref.legendFont,
      width = _ref.width,
      height = _ref.height,
      overflow = _ref.overflow,
      padding = _ref.padding,
      showLegend = _ref.showLegend,
      legendPercentage = _ref.legendPercentage;

  var svgRef = (0, _react.useRef)();
  var svg = svgRef.current;


  (0, _react.useEffect)(function () {
    renderChart();
  }, []);

  (0, _react.useEffect)(function () {
    if (width !== 0 && height !== 0) {
      renderChart();
    }
  }, [width, height]);

  var renderChart = function renderChart() {
    // Reset the svg element to a empty state.
    svg.innerHTML = "";
    // Allow bubbles overflowing its SVG container in visual aspect if props(overflow) is true.
    if (overflow) svg.style.overflow = "visible";

    var bubblesWidth = showLegend ? width * (1 - legendPercentage / 100) : width;
    var legendWidth = width - bubblesWidth;
    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    var pack = d3.pack().size([bubblesWidth * graph.zoom, bubblesWidth * graph.zoom]).padding(padding);

    // Process the data to have a hierarchy structure;
    var root = d3.hierarchy({ children: data }).sum(function (d) {
      return d.value;
    }).sort(function (a, b) {
      return b.value - a.value;
    }).each(function (d) {
      if (d.data.label) {
        d.label = d.data.label;
        d.id = d.data.label.toLowerCase().replace(/ |\//g, "-");
      }
    });

    // Pass the data to the pack layout to calculate the distribution.
    var nodes = pack(root).leaves();

    // Call to the function that draw the bubbles.
    renderBubbles(bubblesWidth, nodes, color);
    // Call to the function that draw the legend.
    if (showLegend) {
      renderLegend(bubblesWidth, nodes, color);
    }
  };

  var renderBubbles = function renderBubbles(width, nodes, color) {
    var bubbleChart = d3.select(svg).append("g").attr("class", "bubble-chart").attr("transform", function (d) {
      return "translate(" + width * graph.offsetX + "," + width * graph.offsetY + ")";
    });

    var node = bubbleChart.selectAll(".node").data(nodes).enter().append("g").attr("class", "node").attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    }).on("click", function (d) {
      bubbleClickFun(d.label);
    });

    node.append("circle").attr("id", function (d) {
      return d.id;
    }).attr("r", function (d) {
      return d.r - d.r * 0.04;
    }).style("fill", function (d) {
      return d.data.color ? d.data.color : color(nodes.indexOf(d));
    }).style("z-index", 1).on("mouseover", function (d) {
      d3.select(this).attr("r", d.r * 1.04);
    }).on("mouseout", function (d) {
      var r = d.r - d.r * 0.04;
      d3.select(this).attr("r", r);
    });

    node.append("clipPath").attr("id", function (d) {
      return "clip-" + d.id;
    }).append("use").attr("xlink:href", function (d) {
      return "#" + d.id;
    });

    node.append("text").attr("class", "value-text").style("font-size", valueFont.size + "px").attr("clip-path", function (d) {
      return "url(#clip-" + d.id + ")";
    }).style("font-weight", function (d) {
      return valueFont.weight ? valueFont.weight : 600;
    }).style("font-family", valueFont.family).style("fill", function () {
      return valueFont.color ? valueFont.color : "#000";
    }).style("stroke", function () {
      return valueFont.lineColor ? valueFont.lineColor : "#000";
    }).style("stroke-width", function () {
      return valueFont.lineWeight ? valueFont.lineWeight : 0;
    }).text(function (d) {
      return d.value;
    });

    node.append("text").attr("class", "label-text").style("font-size", labelFont.size + "px").attr("clip-path", function (d) {
      return "url(#clip-" + d.id + ")";
    }).style("font-weight", function (d) {
      return labelFont.weight ? labelFont.weight : 600;
    }).style("font-family", labelFont.family).style("fill", function () {
      return labelFont.color ? labelFont.color : "#000";
    }).style("stroke", function () {
      return labelFont.lineColor ? labelFont.lineColor : "#000";
    }).style("stroke-width", function () {
      return labelFont.lineWeight ? labelFont.lineWeight : 0;
    }).text(function (d) {
      return d.label;
    });

    // Center the texts inside the circles.
    d3.selectAll(".label-text").attr("x", function (d) {
      var self = d3.select(this);
      var width = self.node().getBBox().width;
      return -(width / 2);
    }).style("opacity", function (d) {
      var self = d3.select(this);
      var width = self.node().getBBox().width;
      d.hideLabel = width * 1.05 > d.r * 2;
      return d.hideLabel ? 0 : 1;
    }).attr("y", function (d) {
      return labelFont.size / 2;
    });

    // Center the texts inside the circles.
    d3.selectAll(".value-text").attr("x", function (d) {
      var self = d3.select(this);
      var width = self.node().getBBox().width;
      return -(width / 2);
    }).attr("y", function (d) {
      if (d.hideLabel) {
        return valueFont.size / 3;
      } else {
        return -valueFont.size * 0.5;
      }
    });

    node.append("title").text(function (d) {
      return d.label;
    });
  };

  var renderLegend = function renderLegend(offset, nodes, color) {
    var bubble = d3.select(".bubble-chart");
    var bubbleHeight = bubble.node().getBBox().height;

    var legend = d3.select(svg).append("g").attr("transform", function () {
      return "translate(" + offset + "," + bubbleHeight * 0.05 + ")";
    }).attr("class", "legend");

    var textOffset = 0;
    var texts = legend.selectAll(".legend-text").data(nodes).enter().append("g").attr("transform", function (d, i) {
      var offset = textOffset;
      textOffset += legendFont.size + 10;
      return "translate(0," + offset + ")";
    }).on("mouseover", function (d) {
      d3.select("#" + d.id).attr("r", d.r * 1.04);
    }).on("mouseout", function (d) {
      var r = d.r - d.r * 0.04;
      d3.select("#" + d.id).attr("r", r);
    }).on("click", function (d) {
      legendClickFun(d.label);
    });

    texts.append("rect").attr("width", 30).attr("height", legendFont.size).attr("x", 0).attr("y", -legendFont.size).style("fill", "transparent");

    texts.append("rect").attr("width", legendFont.size).attr("height", legendFont.size).attr("x", 0).attr("y", -legendFont.size).style("fill", function (d) {
      return d.data.color ? d.data.color : color(nodes.indexOf(d));
    });

    texts.append("text").style("font-size", legendFont.size + "px").style("font-weight", function (d) {
      return legendFont.weight ? legendFont.weight : 600;
    }).style("font-family", legendFont.family).style("fill", function () {
      return legendFont.color ? legendFont.color : "#000";
    }).style("stroke", function () {
      return legendFont.lineColor ? legendFont.lineColor : "#000";
    }).style("stroke-width", function () {
      return legendFont.lineWeight ? legendFont.lineWeight : 0;
    }).attr("x", function (d) {
      return legendFont.size + 10;
    }).attr("y", 0).text(function (d) {
      return d.label;
    });
  };

  return _react2.default.createElement("svg", { ref: svgRef, width: width, height: height });
};

BubbleChart.propTypes = {
  overflow: _propTypes2.default.bool,
  graph: _propTypes2.default.shape({
    zoom: _propTypes2.default.number,
    offsetX: _propTypes2.default.number,
    offsetY: _propTypes2.default.number
  }),
  width: _propTypes2.default.number,
  height: _propTypes2.default.number,
  padding: _propTypes2.default.number,
  showLegend: _propTypes2.default.bool,
  legendPercentage: _propTypes2.default.number,
  legendFont: _propTypes2.default.shape({
    family: _propTypes2.default.string,
    size: _propTypes2.default.number,
    color: _propTypes2.default.string,
    weight: _propTypes2.default.string
  }),
  valueFont: _propTypes2.default.shape({
    family: _propTypes2.default.string,
    size: _propTypes2.default.number,
    color: _propTypes2.default.string,
    weight: _propTypes2.default.string
  }),
  labelFont: _propTypes2.default.shape({
    family: _propTypes2.default.string,
    size: _propTypes2.default.number,
    color: _propTypes2.default.string,
    weight: _propTypes2.default.string
  })
};
BubbleChart.defaultProps = {
  overflow: false,
  graph: {
    zoom: 1.1,
    offsetX: -0.05,
    offsetY: -0.01
  },
  width: 1000,
  height: 800,
  padding: 0,
  showLegend: true,
  legendPercentage: 20,
  legendFont: {
    family: "Arial",
    size: 12,
    color: "#000",
    weight: "bold"
  },
  valueFont: {
    family: "Arial",
    size: 16,
    color: "#fff",
    weight: "bold"
  },
  labelFont: {
    family: "Arial",
    size: 11,
    color: "#fff",
    weight: "normal"
  },
  bubbleClickFun: function bubbleClickFun(label) {
    console.log("Bubble " + label + " is clicked ...");
  },
  legendClickFun: function legendClickFun(label) {
    console.log("Legend " + label + " is clicked ...");
  }
};