var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "income";
var chosenYAxis = "obesity";
function xScale(CDCData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(CDCData, (d => d[chosenXAxis])) * 0.8,
      d3.max(CDCData, (d => d[chosenXAxis])) * 1.2])
    .range([0, width]);

  return xLinearScale;
}

function yScale(CDCData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([0.9*d3.min(CDCData, d => d[chosenYAxis]), 1.1*d3.max(CDCData, d => d[chosenYAxis])])
    .range([height, 0]);

  return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

function renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d=> xLinearScale(d[chosenXAxis]))
    .attr("cy", d=> yLinearScale(d[chosenYAxis]))

  return circlesGroup;
}

function renderstateLabels(stateLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis) {

  stateLabels.transition()
  .duration(1000)
    .attr("x", d=> xLinearScale(d[chosenXAxis]))
    .attr("y", d=> yLinearScale(d[chosenYAxis]))

  return stateLabels;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([60, -20])
    .html(function(d) {
      return (`${d.state}<hr>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}`);
    })

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip
      .show(data, this)
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data, this);
    });

  return circlesGroup;
}

// Import Data
d3.csv("assets/data/data.csv").then(function(CDCData, err) {
  if (err) throw err;

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    CDCData.forEach(function(data) {
      data.obesity = +data.obesity;
      data.income = +data.income;
      data.age = +data.age;
      data.smokes = +data.smokes;
      console.log(data.smokes, data.obesity)

      
      // console.log(data.abbr);


    });

    console.log(CDCData);

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = xScale(CDCData, chosenXAxis);

    var yLinearScale = yScale(CDCData, chosenYAxis);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, ${width})`)
    .call(leftAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================

    var circlesGroup = chartGroup.append("g")
    .selectAll("circle")
    .data(CDCData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "pink")
    .attr("opacity", "0.5")
   
    var stateLabels = chartGroup.append("g")
    .selectAll("text")
    .data(CDCData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("text-anchor", "middle")
    .attr("font-size", 6)
    .text(d => d.abbr)

    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Income ($)");

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 30)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age");

    var obesityLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (width/2) - 80)
      .attr("x", 0 + (height / 2))
      .attr("value", "obesity")
      .attr("dy", "1em")
      .classed("active", true)
      .text("Obesity - % of Population");

    var smokesLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (width/2)-65)
      .attr("x", 0 + (height / 2))
      .attr("value", "smokes")
      .attr("dy", "1em")
      .classed("inactive", true)
      .text("Smokers - % of Population");

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        console.log(value);
        // if the x-axis is clicked
        if ((value === "age") || (value === "income") && (value !== chosenXAxis)) {
          chosenXAxis = value;
          xLinearScale = xScale(CDCData, chosenXAxis);
          xAxis = renderXAxes(xLinearScale, xAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          stateLabels = renderstateLabels(stateLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          if (chosenXAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        
          else {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
          }    
        }
        // if the x-axis is clicked
        else if ((value === "obesity") || (value === "smokes") && (value !== chosenYAxis)) {
          chosenYAxis = value;
          yLinearScale = yScale(CDCData, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          stateLabels = renderstateLabels(stateLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          if (chosenYAxis === "obesity") {
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
          }        
        }
      });    
  }).catch(function(error) {
    console.log(error);
  });
