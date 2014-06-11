var margin = {
    top: 30,
    right: 40,
    bottom: 70,
    left: 40
},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var data = planes;
// Parse the date / time
var parseDate = d3.time.format("%Y%m%d").parse;

var formatTime = d3.time.format("%Y");

var x = d3.time.scale()
    .range([0, width - 25]);

var bisectDate = d3.bisector(function(d) {
    return d.date;
}).left;

var y = d3.scale.linear().range([height, 0]);

var y0 = d3.scale.linear().range([height, 0]); // Change to y0

var yAxisLeft = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

var yAxisRight = d3.svg.axis().scale(y0)
    .orient("right").ticks(5);

var xAxis = d3.svg.axis()
    .scale(x)
    .tickSize(5)
    .ticks(d3.time.years, 2)
    .orient("bottom")
    .tickFormat(d3.time.format("%Y"));

var line = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return y0(d.accidents);
    })
    .interpolate("cardinal")
    .tension(0.9);

var svg = d3.select(".chart").append("svg")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add grid lines

function make_X_axis() {
    return d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(6);
}

function make_Y_axis() {
    return d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);
}

//load data

d3.csv("data/crashes.csv", function(error, data) {

    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.deaths = +d.deaths;
        d.accidents = +d.accidents;
    });

    x.domain(d3.extent(data, function(d) {
        return d.date;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.deaths;
    })]);
    y0.domain([0, d3.max(data, function(d) {
        return d.accidents;
    })]);

    ///axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end");


    svg.append("g") //Left
    .attr("class", "y axis")
        .call(yAxisLeft)
        .append("text")
        .attr("x", 3)
        .attr("y", -25)
        .attr("dy", ".70em")
        .style("text-anchor", "end")
        .text("Deaths");

    svg.append("g") // Add the Y Axis Right
    .attr("class", "y axis") // Add the Y Axis Right
    .attr("transform", "translate(" + width + " ,0)") // move to the right
    .call(yAxisRight)
        .append("text")
        .attr("x", 40)
        .attr("y", -25)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Accident rate");

    svg.append("g")
        .attr("class", "grid")
        .call(make_Y_axis()
            .tickSize(-width, 0, 0)
            .tickFormat(""));

    var div = d3.select(".chart").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    ///BARS

    svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .style("fill", "#1974b2")
        .attr("x", function(d) {
            return x(d.date) - (width / data.length) / 1000;
        })
        .attr("width", width / data.length - 5)
        .attr("y", function(d) {
            return y(d.deaths);
        })
        .attr("height", function(d) {
            return height - y(d.deaths);
        });

    svg.selectAll("rect")
        .attr("width", width / data.length - 4)
        .on("mouseover", function(d) {
            div.transition()
                .duration(50)
                .style("opacity", .9);
            div.html("<h3>"+ formatTime(d.date) + "</h3>" + "<br/>" +"<p>Deaths: " +  "<strong>"+ d.deaths + "</strong>"+"</p>")
                .style("left", (d3.event.pageX) + 10+"px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(50)
                .style("opacity", 1e-6);
        });

    svg.append("path") // Add the line path.
    .data(data)
        .attr("class", "line")
        .attr("d", line(data));

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 4.5);

    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", 120)
        .on("mouseover", function() {
            focus.style("display", null);
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(50)
                .style("opacity", 1e-6);
        })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        //move focus around
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d.accidents) + ")");
        div.transition()
            .duration(50)
            .style("opacity", .9);
        div.html("<h3>"+ formatTime(d.date) + "</h3>" + "<br/>" +"<p>Rate: " + "<strong>"+d.accidents + "</strong>" + " accidents " + "</p>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }
});