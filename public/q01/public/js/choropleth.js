const svg = d3.select("svg"),
  width = svg.attr("width"),
  height = svg.attr("height"),
  path = d3.geoPath(),
  data = d3.map(),
  worldmap =
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
  worldpopulation =
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv";

let centered, world;

const projection = d3
  .geoRobinson()
  .scale(130)
  .translate([width / 2, height / 2]);

const colorScale = d3
  .scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(d3.schemeGreens[7]);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.queue()
  .defer(d3.json, worldmap)
  .defer(d3.csv, worldpopulation, function (d) {
    data.set(d.code, +d.pop);
  })
  .await(ready);

svg
  .append("rect")
  .attr("class", "background")
  .attr("width", width)
  .attr("height", height)
  .on("click", click);

function ready(error, topo) {
  let mouseOver = function (d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", 0.5)
      .style("stroke", "transparent");
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black");
    tooltip
      .style("left", d3.event.pageX + 15 + "px")
      .style("top", d3.event.pageY - 28 + "px")
      .transition()
      .duration(400)
      .style("opacity", 1)
      .text(
        d.properties.name +
          ": " +
          Math.round((d.total / 1000000) * 10) / 10 +
          " million"
      );
  };

  let mouseLeave = function () {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "transparent");
    tooltip.transition().duration(300).style("opacity", 0);
  };

  world = svg.append("g").attr("class", "world");
  world
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("data-name", function (d) {
      return d.properties.name;
    })

    .attr("fill", function (d) {
      d.total = data.get(d.id) || 0;
      return colorScale(d.total);
    })

    .style("stroke", "transparent")
    .attr("class", function (d) {
      return "Country";
    })
    .attr("id", function (d) {
      return d.id;
    })
    .style("opacity", 1)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)
    .on("click", click);

  const x = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);

  const legend = svg.append("g").attr("id", "legend");

  const legend_entry = legend
    .selectAll("g.legend")
    .data(
      colorScale.range().map(function (d) {
        d = colorScale.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      })
    )
    .enter()
    .append("g")
    .attr("class", "legend_entry");

  const ls_w = 20,
    ls_h = 20;

  legend_entry
    .append("rect")
    .attr("x", 20)
    .attr("y", function (d, i) {
      return height - i * ls_h - 2 * ls_h;
    })
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function (d) {
      return colorScale(d[0]);
    })
    .style("opacity", 0.8);

  legend_entry
    .append("text")
    .attr("x", 50)
    .attr("y", function (d, i) {
      return height - i * ls_h - ls_h - 6;
    })
    .text(function (d, i) {
      if (i === 0) return "< " + d[1] / 1000000 + " m";
      if (d[1] < d[0]) return d[0] / 1000000 + " m +";
      return d[0] / 1000000 + " m - " + d[1] / 1000000 + " m";
    });

  legend
    .append("text")
    .attr("x", 15)
    .attr("y", 280)
    .text("Population (Million)");
}

function click(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = -(centroid[0] * 6);
    y = centroid[1] * 6;
    k = 3;
    centered = d;
  } else {
    x = 0;
    y = 0;
    k = 1;
    centered = null;
  }

  world.selectAll("path").classed(
    "active",
    centered &&
      function (d) {
        return d === centered;
      }
  );

  world
    .transition()
    .duration(750)
    .attr("transform", "translate(" + x + "," + y + ") scale(" + k + ")");
}
