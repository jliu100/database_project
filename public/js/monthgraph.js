


console.log(111);
// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("align","center")
    .attr("width", width + margin.left + margin.right+300)
    .attr("height", height + margin.top + margin.bottom+100)
    
  .append("g")
    .attr("transform",
          "translate(" + (margin.left+300) + "," + (margin.top+100) + ")");

//Read the data


// let pr= new Promise((resolve,reject)=>{
  
  let data =[];
  var script_tag = document.getElementById('searcher');
  var script_tag = document.getElementById('searcher');
  var date= script_tag.getAttribute("data-date");
  var weight= script_tag.getAttribute("data-number");

  console.log(date);
  console.log(weight);
  var newWeight, newDate;
  
  while(date.indexOf(",")!=-1)
  {

      newWeight=Number(weight.substr(0,weight.indexOf(',')));
      // console.log(date.substr(0,date.indexOf(',')));
      newDate=date.substr(0,date.indexOf(','));
      console.log(newWeight);
      console.log(newDate);
      data.push({date: d3.timeParse("%Y-%-m")(newDate),value: newWeight});

      date=date.substr(date.indexOf(',')+1);
      weight=weight.substr(weight.indexOf(',')+1);
  }


 graph(data);

  // Now I can use this dataset:
  function graph(data) {

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.date; }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain( [0, 200])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .curve(d3.curveBasis) // Just add that to have a curve instead of segments
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })
        )

    // create a tooltip
    var Tooltip = d3.select("#my_dataviz")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        Tooltip
          .style("opacity", 1)
      }
      var mousemove = function(d) {
        Tooltip
          .html("Exact value: " + d.value +" Date: "+ d.date)
          .style("left", (d3.mouse(this)[0]+370) + "px")
          .style("top", (d3.mouse(this)[1]+125) + "px")
      }
      var mouseleave = function(d) {
        Tooltip
          .style("opacity", 0)
      }

    // Add the points
    svg
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("class", "myCircle")
        .attr("cx", function(d) { return x(d.date) } )
        .attr("cy", function(d) { return y(d.value) } )
        .attr("r", 8)
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 3)
        .attr("fill", "white")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
}

