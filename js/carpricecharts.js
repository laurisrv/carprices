var fuelChart, makeCountChart, makeModelCountChart, yearlyChart, yearlyPriceChart, makeModelAgingChart, priceCountChart, engineCountChart, powerCountChart;
// load data from a csv file
d3.csv("cars20130908.csv", function(data) {
	var numberFormat = d3.format(".2f");
	fuelChart = dc.pieChart("#fuel-chart");
	makeCountChart = dc.cappedRowChart("#make-count-chart");
	makeModelCountChart = dc.cappedRowChart("#make-model-count-chart");
	yearlyChart = dc.barChart("#yearly-chart");
	//yearlyPriceChart = dc.barChart("#yearly-price-chart");
	yearlyPriceChart = dc.compositeChart("#yearly-price-chart");
	makeModelAgingChart = dc.bubbleChart("#make-model-aging-chart");
	//enginePowerChart = dc.bubbleChart("#engine-power-chart");
	priceCountChart = dc.barChart("#price-count-chart");
	engineCountChart = dc.barChart("#engine-count-chart");
	powerCountChart = dc.barChart("#power-count-chart");

	//yearlyChart = dc.rowChart("#yearly-chart");

	// feed it through crossfilter
	var cars = crossfilter(data);
	var allCars = cars.groupAll();



	var yearDimension = cars.dimension(function(d) {
		return +d.year;
	});

	var yearGroup = yearDimension.group();
	var priceFunc = function(d) {
		return d.price;
	};
	var priceByYearGroup = reducerlib.quantile(yearDimension, priceFunc);

	var makeDimension = cars.dimension(function(d) {
		return d.make;
	});


	var makeModelDimension = cars.dimension(function(d) {
		return d.make + " " + d.model;
	});

	var makeModelGroup = reducerlib.average(makeModelDimension, priceFunc)
		.order(reducerlib.average.count);

	var makeGroup = reducerlib.average(makeDimension, priceFunc)
		.order(reducerlib.average.count);

	var fuelDimension = cars.dimension(function(d) {
		return d.fuel;
	});
	var fuelGroup = fuelDimension.group();

	fuelChart.width(180)
		.height(180)
		.radius(80)
		.innerRadius(30)
		.dimension(fuelDimension)
		.group(fuelGroup)
		.label(function(d) {
		return d.data.key;
	});

	makeCountChart.width(180)
		.height(500)
		.margins({
		top: 20,
		left: 10,
		right: 10,
		bottom: 20
	})
		.group(makeGroup)
		.dimension(makeDimension)
		.valueAccessor(function(p) {
		return p.value.count;
	})
		.othersGrouper(function(data, sum) {
	})
		.label(function(d) {
		return d.key;
	})
		.title(function(d) {
		return d.key + " " + d.value.count;
	})
		.elasticX(true)
		.dataCap(20)
		.xAxis().ticks(4);

	var priceDimension = cars.dimension(function(d) {
		var from = Math.floor(d.price / 1000);
		return from*1000;
		/*
		 if (d.price <= 10000) {
		 return Math.floor(d.price / 1000) * 1000;
		 }
		 else if (d.price <= 50000){
		 return Math.floor(d.price / 5000) * 5000;
		 }else{
		 return Math.floor(d.price / 10000) * 10000;
		 }
		 */
	});
	var priceCountGroup = priceDimension.group();

	priceCountChart.width(420)
		.height(180)
		.margins({
		top: 10,
		right: 50,
		bottom: 30,
		left: 60
	})
		.dimension(priceDimension)
		.group(priceCountGroup)
		.elasticY(true)
		.centerBar(true)
		.gap(1)
		.x(d3.scale.linear().domain([0, 50000]))
		.xUnits(function(f,s,d){
		return Math.abs(Math.floor(f / 1000)-Math.floor(s / 1000))+1;
	})
//		.x(d3.scale.ordinal().domain(d3.range(0,50000,2000)))
		.renderHorizontalGridLines(true)
		.filterPrinter(function(filters) {
		var filter = filters[0], s = "";
		s += Math.floor(filter[0]/1000)*1000 + " to " + Math.floor(filter[1]/1000)*1000;
		return s;
	})
		.xAxis()
		.tickFormat(function(v) {
		return v + "";
	});


	makeModelCountChart.width(180)
		.height(500)
//						.margins({
//						top: 20,
//						left: 10,
//						right: 10,
//						bottom: 20
//					})
		.group(makeModelGroup)
		.dimension(makeModelDimension)
		.colors(d3.scale.category20b())
		.valueAccessor(function(p) {
		return p.value.count;
	})
		.othersGrouper(function(data, sum) {
	})
		.label(function(d) {
		return d.key;
	})
		.title(function(d) {
		return d.key + " " + d.value.count;
	})
		.elasticX(true)
		.dataCap(20)
		.xAxis().ticks(4);

	yearlyChart.width(500)
		.height(100)
		.margins({
		top: 10,
		right: 50,
		bottom: 30,
		left: 40
	})
		.dimension(yearDimension)
		.group(yearGroup)
		.elasticY(true)
		.elasticX(true)
		.centerBar(true)
		.gap(1)
		//.round(dc.round.floor)
		.x(d3.scale.linear().domain([1990, 2013]))
		//.renderHorizontalGridLines(true)
//									.filterPrinter(function(filters) {
//									var filter = filters[0], s = "";
//									s += numberFormat(filter[0]) + "% -> " + numberFormat(filter[1]) + "%";
//									return s;
//								})
		.xAxis()
		.tickFormat(function(v) {
		return "" + v;
	});
	;

	yearlyPriceChart.width(500)
		.height(300)
		.margins({
		top: 10,
		right: 50,
		bottom: 30,
		left: 60
	})
		.dimension(yearDimension)
		.group(priceByYearGroup)
		.elasticY(true)
		//.elasticX(true)
		//.centerBar(true)
		//.gap(1)
		.x(d3.scale.linear().domain([1990, 2013]))
		//.renderHorizontalGridLines(true);
//									.filterPrinter(function(filters) {
//									var filter = filters[0], s = "";
//									s += numberFormat(filter[0]) + "% -> " + numberFormat(filter[1]) + "%";
//									return s;
//								})
		.mouseZoomable(true)
		.legend(dc.legend().x(100).y(10).itemHeight(13).gap(5))
		.brushOn(false)
		.rangeChart(yearlyChart)
		.compose([
		dc.lineChart(yearlyPriceChart).group(priceByYearGroup, "Min")
			.colors(["#eeeeee"].concat(d3.scale.category20c().range()))
			.valueAccessor(reducerlib.quantile.lowQuantile)
			/*
			 .valueAccessor(function(p) {
			 //return p.value.price>1?p.value.price:1;
			 return p.value.price;
			 })*/
			.renderArea(true)
			.stack(priceByYearGroup, "Median", function(d) {
			//return d.value.price-groupMedianF(d);
			return reducerlib.quantile.median(d) - reducerlib.quantile.lowQuantile(d);
		})
			.stack(priceByYearGroup, "Max", function(d) {
			//return d.value.price-groupMedianF(d);
			return reducerlib.quantile.highQuantile(d) - reducerlib.quantile.median(d);
		})
			.title(function(d) {
			//var value = d.data.value.price;
			var value = reducerlib.quantile.median(d.data);
			if (isNaN(value))
				value = 0;
			return "Year " + d.data.key + "\nMedian price " + value;
		})
	])
		.xAxis()
		.tickFormat(function(v) {
		return "" + v;
	});
	;


	var engineDimension = cars.dimension(function(d) {
		return Math.floor(+d.engine*10)/10;
	});
	var engineGroup = engineDimension.group();
	engineCountChart.width(420)
		.height(180)
		.margins({
		top: 10,
		right: 50,
		bottom: 30,
		left: 60
	})
		.dimension(engineDimension)
		.group(engineGroup)
		.elasticY(true)
		.centerBar(true)
		.gap(1)
		.x(d3.scale.linear().domain([0, 5]))
		.xUnits(function(f,s,d){
		return Math.abs(Math.floor(f*10)-Math.floor(s*10))+1;
	})
		.renderHorizontalGridLines(true)
		.filterPrinter(function(filters) {
		var filter = filters[0], s = "";
		s += Math.floor(filter[0]*10)/10 + " to " + Math.floor(filter[1]*10)/10 +" l."
		return s;
	})
		.xAxis()
		.tickFormat(function(v) {
		return v + "";
	});
	
	var powerDimension = cars.dimension(function(d) {
		return Math.floor(+d.power/5)*5;
	});
	var powerGroup = powerDimension.group();
	powerCountChart.width(420)
		.height(180)
		.margins({
		top: 10,
		right: 50,
		bottom: 30,
		left: 60
	})
		.dimension(powerDimension)
		.group(powerGroup)
		.elasticY(true)
		.centerBar(true)
		.gap(1)
		.x(d3.scale.linear().domain([0, 250]))
		.xUnits(function(f,s,d){
		return Math.abs(Math.floor(f/5)-Math.floor(s/5))+1;
	})
		.renderHorizontalGridLines(true)
		.filterPrinter(function(filters) {
		var filter = filters[0], s = "";
		s += Math.floor(filter[0]/5)*5 + " to " + Math.floor(filter[1]/5)*5+" kW";
		return s;
	})
		.xAxis()
		.tickFormat(function(v) {
		return v + "";
	});
	
/*
	var enginePowerDimension = cars.dimension(function(d) {
		var s = {valueOf:function(){return this.engine + "l., "+this.power+"kW";}};
		s.engine = +d.engine||0;
		s.power = +d.power||0;
		//s.valueOf = function()
		return s;
	});
	var enginePowerGroup = enginePowerDimension.group();
	enginePowerChart.width(600)
		.height(400)
		.margins({
		top: 10,
		right: 50,
		bottom: 30,
		left: 60
	})
		.dimension(enginePowerDimension)
		.group(enginePowerGroup)
		.transitionDuration(0)
		//.colorDomain([0, 1])
		//.colorAccessor(function(d,i){return i;})
		//.colors(["#a60000", "#ff0000", "#ff4040", "#ff7373", "#67e667", "#39e639", "#00cc00"])
		//.colorDomain([-12000, 12000])
		//.colorAccessor(function(d) {
		//return d.value.absGain;
		//})
		.keyAccessor(function(d){
			return +d.key.engine;
		})
		.valueAccessor(function(d){
			return +d.key.power;
		})
		.radiusValueAccessor(function(d){
			return +d.value;
		})
		.maxBubbleRelativeSize(0.01)
//									.x(d3.scale.linear().domain([-2500, 2500]))
//									.y(d3.scale.linear().domain([-100, 100]))
//									.r(d3.scale.linear().domain([0, 4000]))
		.x(d3.scale.linear().domain([0, 5]))
		.y(d3.scale.linear().domain([0, 300]))
		.r(d3.scale.linear().domain([0, 50]))
		//.elasticY(true)
		.yAxisPadding(100)
		//.elasticX(true)
		.xAxisPadding(-60)
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.renderLabel(true)
		.renderTitle(true)
		.label(function(p) {
		return p.key.valueOf();
	})
		.title(function(p) {
		return p.key.valueOf()
//			+ "\n"
//			+ "Initial price: " + initialPriceFunc(p) + "\n"
//			+ "Half age: " + halfAgeFunc(p) + "\n"
//			+ "r2: " + reducerlib.linearFit.r2(p) + "\n"
//			+ "Count: " + p.value.count
			;
	})
		.yAxis().tickFormat(function(v) {
		return v + "";
	});
	enginePowerChart.MIN_RADIUS = 3;
	*/

	var makeModelAging = reducerlib.linearFit(makeModelDimension, function(d) {
		var age = 2013 - d.year;
		age = age >= 1 ? age : 1;
		return age;
	}, function(d) {
		return Math.log(d.price);
	})
		.order(reducerlib.average.count);
	var validateFitFunc = function(d) {
		return d.value.count > 40 && reducerlib.linearFit.r2(d) > 0.5;
		var res = Math.exp(reducerlib.linearFit.slope(d) * 3 + reducerlib.linearFit.offset(d))
		return isFinite(res) && res < 2e+5 ? res : 1;
	}, initialPriceFunc = function(d) {
		if (!validateFitFunc(d))
			return 0;
		var res = Math.exp(reducerlib.linearFit.slope(d) * 3 + reducerlib.linearFit.offset(d))
		return isFinite(res) && res < 2e+5 ? res : 1;
	}, halfAgeFunc = function(d) {
		if (!validateFitFunc(d))
			return 0;
		var res = -Math.LN2 / reducerlib.linearFit.slope(d);
		return isFinite(res) && res > 0 && res < 10 ? res : 10;
	}, radiusFunc = function(d) {
		if (!validateFitFunc(d))
			return 0;
		var res = reducerlib.linearFit.count(d);
		return res;
	};


	makeModelAgingChart.width(990)
		.height(400)
		.margins({
		top: 10,
		right: 50,
		bottom: 30,
		left: 60
	})
		.dimension(makeModelDimension)
		.group(makeModelAging)
		.transitionDuration(100)
		.colorDomain([0, 1])
		.colorAccessor(reducerlib.linearFit.r2)
		//.colors(["#a60000", "#ff0000", "#ff4040", "#ff7373", "#67e667", "#39e639", "#00cc00"])
		//.colorDomain([-12000, 12000])
		//.colorAccessor(function(d) {
		//return d.value.absGain;
		//})
		.keyAccessor(halfAgeFunc)
		.valueAccessor(initialPriceFunc)
		.radiusValueAccessor(radiusFunc)
		.maxBubbleRelativeSize(0.01)
//									.x(d3.scale.linear().domain([-2500, 2500]))
//									.y(d3.scale.linear().domain([-100, 100]))
//									.r(d3.scale.linear().domain([0, 4000]))
		.x(d3.scale.linear().domain([3, 10]))
		.y(d3.scale.linear().domain([0, 100000]))
		.r(d3.scale.linear().domain([0, 500]))
		//.elasticY(true)
		.yAxisPadding(100)
		//.elasticX(true)
		.xAxisPadding(500)
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.renderLabel(true)
		.renderTitle(true)
		.label(function(p) {
		return p.key;
	})
		.title(function(p) {
		return p.key
			+ "\n"
			+ "Initial price: " + initialPriceFunc(p) + "\n"
			+ "Half age: " + halfAgeFunc(p) + "\n"
			+ "r2: " + reducerlib.linearFit.r2(p) + "\n"
			+ "Count: " + p.value.count
			;
	})
		.yAxis().tickFormat(function(v) {
		return v + "";
	});
	makeModelAgingChart.MIN_RADIUS = 3;


	dc.dataCount(".dc-car-data-count")
		.dimension(cars)
		.group(allCars);

	dc.renderAll();
}
);
