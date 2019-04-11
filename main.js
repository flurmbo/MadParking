// https://gates.transportation.wisc.edu/occupancy/  -- campus data!!!

const KEY = "AIzaSyAGI2LxsYLsQrsY9T6_UuPParEnUrLbSgs";
const SHEET_ID = "1RAx4HNhkEj6cYjO5XpyJj30bAKoDOPy7Cfr9nA-NWJE";
const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!B:I?key=${KEY}`;

lotLabels = [
  "Brayton",
  "Capitol North",
  "Government East",
  "Overture Center",
  "South Livingston",
  "State St. Campus",
  "State St. Campus"
];

shown = [true, true, true, true, true, true, true];

$.ajax({
  url: URL,
  success: function(data) {
    drawPlot(parseData(data));
  },
  error: function(data) {
    console.log("failed with data: ");
    console.log(data);
  }
});

function parseData(data) {
  return data.values.slice(1).map(function(d) {
    return { time: d[0], lots: d.slice(1).map(x => Math.max(0, x)) };
  });
}

function drawPlot(data) {
  var svg = d3.select("svg"),
    margin = { top: 20, right: 20, bottom: 110, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;
  var parseDate = d3.timeParse("%Q");
  var g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var xScale = d3
    .scaleTime()
    .range([0, width])
    .domain(
      d3.extent(data, function(d) {
        return parseDate(d.time);
      })
    );
  var yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain(
      d3.extent(
        data.reduce(function(acc, cur) {
          return [...acc, ...cur.lots];
        }, [])
      )
    );
  yAxis = d3.axisLeft(yScale);

  lotLabels.forEach((label, index) => {
    if (shown[index]) {
      var line3 = d3
        .line()
        .x(function(d) {
          return xScale(parseDate(d.time));
        })
        .y(function(d) {
          return yScale(d.lots[index]);
        })
        .curve(d3.curveMonotoneX);
      g.append("path")
        .datum(data)
        .attr("class", `line-${index}`)
        .attr("d", line3)
        .attr("stroke", d3.schemeCategory10[index])
        .enter();
    }
  });

  var lgs = svg
    .selectAll(".legendItem")
    .data(lotLabels)
    .enter()
    .append("g")
    .attr("class", "legendItem")
    .on("click", function(d, i) {
      if (shown[i]) {
        shown[i] = false;
        d3.select(this)
          .selectAll("text")
          .attr("text-decoration", "line-through");
      } else {
        shown[i] = true;
        d3.select(this)
          .selectAll("text")
          .attr("text-decoration", "none");
      }
      update();
    });

  lgs
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function(d, i) {
      return d3.schemeCategory10[i];
    });

  lgs
    .append("text")
    .attr("x", 15)
    .attr("y", 10)
    //.attr("dy", ".35em")
    .text(function(d, i) {
      return d;
    })
    .attr("class", "textselected")
    .style("text-anchor", "start")
    .style("font-size", 15);

  let offset = 0;
  lgs.attr("transform", function(d, i) {
    let x = offset;
    offset += this.getBBox().width;
    console.log(offset);
    return `translate(${x + 10 * i},0)`;
  });
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));
  g.append("g")
    .attr("class", "yAxis")
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Vacancies");
  update = update.bind({ xScale, yScale, svg, g, data, parseDate });
  // svg
  //   .append("path")
  //   .datum(data)
  //   .attr("class", "line")
  //   //      .attr("style", "color: blue")
  //   .attr("d", line)
  //   .enter();

  // svg
  //   .append("path")
  //   .datum(data)
  //   .attr("class", "line")
  //   //      .attr("style", "color: blue")
  //   .attr("d", line)
  //   .enter();
}

function update() {
  console.log("updating");
  parseDate = this.parseDate;
  xScale = this.xScale;
  yScale = this.yScale;
  data = this.data;

  this.yScale.domain(
    d3.extent(
      data.reduce(function(acc, cur) {
        return [...acc, ...cur.lots.filter((val, index) => shown[index])];
      }, [])
    )
  );
  this.svg
    .selectAll(".yAxis")
    .transition()
    .duration(1000)
    .call(yAxis);
  lotLabels.forEach((label, index) => {
    const newLine = d3
      .line()
      .x(function(d) {
        return xScale(parseDate(d.time));
      })
      .y(function(d) {
        return yScale(d.lots[index]);
      })
      .curve(d3.curveMonotoneX);
    this.svg
      .selectAll(`.line-${index}`)
      .transition()
      .duration(1000)
      .attr("d", newLine)
      .style("opacity", shown[index] ? 1 : 0);
  });
}
