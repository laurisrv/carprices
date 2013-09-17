/*
 * row chart fuctionality extented, but most of the code is copy pasted from dc lib rowChart.js
 * because there is no simple and elegant way to override private methods
 * */

dc.cappedRowChart = function(parent, chartGroup) {
	var _dataCap = Infinity;
	var _othersLabel = "Others";
	var _othersGrouper = function(data, sum) {
		data.push({
			"key": _othersLabel,
			"value": sum
		});
	};

	var _requiredPartialKeyValue = "";

	function filterKeys(values) {
		if (_requiredPartialKeyValue && _requiredPartialKeyValue.length > 0) {
			var re = new RegExp("^"+_requiredPartialKeyValue+"| "+_requiredPartialKeyValue,"i");
			return values.filter(function(d, i) {
				//return d.key&&d.key.length>0&&(d.key.toLowerCase().indexOf(_requiredPartialKeyValue)===0||d.key.indexOf(" "+_requiredPartialKeyValue)>0);
				return d.key&&d.key.length>0&&d.key.search(re)!==-1;
			});
		}
		else {
			return values;
		}
	}

	function cappedData() {
		var res;
		if (_dataCap == Infinity) {
			//return _chart.orderedGroup().top(_slicesCap); // ordered by keys
			res = filterKeys(_chart.group().all());
		} else {
			var topRows = filterKeys(_chart.group().top(_chart.group().size())); // ordered by value
			if(topRows&&topRows.length){
				topRows = topRows.slice(0,Math.min(_dataCap,topRows.length));
			}
			var topRowsSum = d3.sum(topRows, _chart.valueAccessor());

			var allRows = filterKeys(_chart.group().all());
			var allRowsSum = d3.sum(allRows, _chart.valueAccessor());

			_othersGrouper(topRows, allRowsSum - topRowsSum);

			res = topRows;
		}
		return res;
	}
/*the code comes from dc rowChart*/

	var _g;

	var _labelOffsetX = 10;

	var _labelOffsetY = 15;

	var _gap = 5;

	var _rowCssClass = "row";

	var _chart = dc.marginable(dc.colorChart(dc.baseChart({
	})));

	var _x;

	var _elasticX;

	var _xAxis = d3.svg.axis().orient("bottom");

	function calculateAxisScale() {
		if (!_x || _elasticX) {
			_x = d3.scale.linear().domain([0, d3.max(cappedData(), _chart.valueAccessor())])
				.range([0, _chart.effectiveWidth()]);

			_xAxis.scale(_x);
		}
	}

	function drawAxis() {
		var axisG = _g.select("g.axis");

		calculateAxisScale();

		if (axisG.empty())
			axisG = _g.append("g").attr("class", "axis")
				.attr("transform", "translate(0, " + _chart.effectiveHeight() + ")");

		dc.transition(axisG, _chart.transitionDuration())
			.call(_xAxis);
	}

	_chart.doRender = function() {
		_chart.resetSvg();

		_g = _chart.svg()
			.append("g")
			.attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")");

		drawAxis();
		drawGridLines();
		drawChart();

		return _chart;
	};

	_chart.title(function(d) {
		return _chart.keyAccessor()(d) + ": " + _chart.valueAccessor()(d);
	});

	_chart.label(function(d) {
		return _chart.keyAccessor()(d);
	});

	_chart.x = function(x) {
		if (!arguments.length)
			return _x;
		_x = x;
		return _chart;
	};

	function drawGridLines() {
		_g.selectAll("g.tick")
			.select("line.grid-line")
			.remove();

		_g.selectAll("g.tick")
			.append("line")
			.attr("class", "grid-line")
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", 0)
			.attr("y2", function(d) {
			return -_chart.effectiveHeight();
		});
	}

	function drawChart() {
		drawAxis();
		drawGridLines();

		var rows = _g.selectAll("g." + _rowCssClass)
			.data(cappedData());

		createElements(rows);
		removeElements(rows);
		updateElements(rows);
	}

	function createElements(rows) {
		var rowEnter = rows.enter()
			.append("g")
			.attr("class", function(d, i) {
			return _rowCssClass + " _" + i;
		});

		rowEnter.append("rect").attr("width", 0);

		createLabels(rowEnter);
		updateLabels(rows);
	}

	function removeElements(rows) {
		rows.exit().remove();
	}

	function updateElements(rows) {
		var height = rowHeight();

		rows = rows.attr("transform", function(d, i) {
			return "translate(0," + ((i + 1) * _gap + i * height) + ")";
		}).select("rect")
			.attr("height", height)
			.attr("fill", _chart.getColor)
			.on("click", onClick)
			.classed("deselected", function(d) {
			return (_chart.hasFilter()) ? !_chart.isSelectedRow(d) : false;
		})
			.classed("selected", function(d) {
			return (_chart.hasFilter()) ? _chart.isSelectedRow(d) : false;
		});

		dc.transition(rows, _chart.transitionDuration())
			.attr("width", function(d) {
			return _x(_chart.valueAccessor()(d));
		});

		createTitles(rows);
	}

	function createTitles(rows) {
		if (_chart.renderTitle()) {
			rows.selectAll("title").remove();
			rows.append("title").text(function(d) {
				return _chart.title()(d);
			});
		}
	}

	function createLabels(rowEnter) {
		if (_chart.renderLabel()) {
			rowEnter.append("text")
				.on("click", onClick);
		}
	}

	function updateLabels(rows) {
		if (_chart.renderLabel()) {
			rows.select("text")
				.attr("x", _labelOffsetX)
				.attr("y", _labelOffsetY)
				.attr("class", function(d, i) {
				return _rowCssClass + " _" + i;
			})
				.text(function(d) {
				return _chart.label()(d);
			});
		}
	}

	function numberOfRows() {
		return cappedData().length;
	}

	function rowHeight() {
		var n = numberOfRows();
		return (_chart.effectiveHeight() - (n + 1) * _gap) / n;
	}

	function onClick(d) {
		_chart.onClick(d);
	}

	_chart.doRedraw = function() {
		drawChart();
		return _chart;
	};

	_chart.xAxis = function() {
		return _xAxis;
	};

	_chart.gap = function(g) {
		if (!arguments.length)
			return _gap;
		_gap = g;
		return _chart;
	};

	_chart.elasticX = function(_) {
		if (!arguments.length)
			return _elasticX;
		_elasticX = _;
		return _chart;
	};

	_chart.labelOffsetX = function(o) {
		if (!arguments.length)
			return _labelOffsetX;
		_labelOffsetX = o;
		return _chart;
	};

	_chart.labelOffsetY = function(o) {
		if (!arguments.length)
			return _labelOffsetY;
		_labelOffsetY = o;
		return _chart;
	};

	_chart.isSelectedRow = function(d) {
		return _chart.hasFilter(_chart.keyAccessor()(d));
	};

	_chart.dataCap = function(_) {
		if (!arguments.length)
			return _dataCap;
		_dataCap = _;
		return _chart;
	};

	_chart.othersLabel = function(_) {
		if (!arguments.length)
			return _othersLabel;
		_othersLabel = _;
		return _chart;
	};

	_chart.othersGrouper = function(_) {
		if (!arguments.length)
			return _othersGrouper;
		_othersGrouper = _;
		return _chart;
	};

	_chart.requiredPartialKeyValue = function(_) {
		if (!arguments.length)
			return _requiredPartialKeyValue;
		_requiredPartialKeyValue = _;
		return _chart;
	};


	return _chart.anchor(parent, chartGroup);
};
