let currentYear = "2022 Population";

async function drawPieChart(year) {
  const dataURL = "data/world_population.csv";
  const response = await fetch(dataURL);
  const data = await response.text();
  const parsedData = d3.csvParse(data);

  const pieData = parsedData.map((d) => ({
    name: d.Country,
    population: +d[year],
  }));

  const width = 800;
  const height = 410;
  const radius = Math.min(width, height) / 2;

  const svg = d3
    .select("#svgContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const pie = d3.pie().value((d) => d.population);
  const path = d3
    .arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  const arc = svg
    .selectAll(".arc")
    .data(pie(pieData))
    .enter()
    .append("g")
    .attr("class", "arc");

  arc
    .append("path")
    .attr("d", path)
    .attr("fill", (d) => color(d.data.name))
    .transition()
    .duration(1000)
    .attrTween("d", function (d) {
      const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t) {
        return path(interpolate(t));
      };
    });

  arc
    .append("text")
    .attr("transform", function (d) {
      const [x, y] = path.centroid(d);
      return `translate(${x},${y})`;
    })
    .attr("dy", "0.35em")
    .text((d) => d.data.name)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "white");

  const tooltip = d3
    .select("#svgContainer")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("pointer-events", "none");

  arc
    .append("path")
    .attr("d", path)
    .attr("fill", "transparent")
    .on("mouseover", (event, d) => {
      const populationInMillions =
        Math.round((d.data.population / 1000000) * 10) / 10;
      const tooltipHtml =
        `<strong>Country:</strong> ${d.data.name}<br>` +
        `<strong>Population:</strong> ${populationInMillions} million`;

      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(tooltipHtml)
        .style("left", `${event.clientX - tooltip.node().offsetWidth / 2}px`)
        .style("top", `${event.clientY - tooltip.node().offsetHeight - 20}px`);
    })

    .on("mousemove", (event) => {
      const [x, y] = d3.pointer(event, svg.node());

      tooltip
        .style("left", `${event.clientX - tooltip.node().offsetWidth / 2}px`)
        .style("top", `${event.clientY - tooltip.node().offsetHeight - 20}px`);
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

function changeData(year) {
  currentYear = year + " Population";
  d3.select("body svg").remove();
  drawPieChart(currentYear);
}

drawPieChart(currentYear);
