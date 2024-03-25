d3.csv("data/world_population.csv").then((data) => {
  data.forEach((d) => {
    d.pop = +d.pop;
  });

  data.sort((a, b) => b.pop - a.pop);

  const svg = d3.select("svg");
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
  const y = d3.scaleLinear().rangeRound([height, 0]);

  g.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", `translate(0,${height})`);

  g.append("g")
    .attr("class", "axis axis-y")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s")))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("");

  function updateTopCountries(value) {
    const selectedCountries = data.slice(0, value);

    x.domain(selectedCountries.map((d) => d.name));
    y.domain([0, d3.max(selectedCountries, (d) => d.pop)]);

    const line = d3
      .line()
      .x((d) => x(d.name) + x.bandwidth() / 2)
      .y((d) => y(d.pop));

    const path = g.selectAll(".line").data([selectedCountries]);
    path
      .enter()
      .append("path")
      .attr("class", "line")
      .merge(path)
      .attr("fill", "none")
      .attr("stroke", "cyan")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", line);

    g.select(".axis-x")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-25)")
      .style("text-anchor", "end");

    g.select(".axis-y").call(
      d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s"))
    );

    const dots = g.selectAll(".dot").data(selectedCountries);

    dots.exit().remove();

    dots
      .enter()
      .append("circle")
      .attr("class", "dot")
      .merge(dots)
      .attr("cx", (d) => x(d.name) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.pop))
      .attr("r", 5)
      .attr("fill", "red")
      .on("mouseover", function (event, d) {
        d3.select(".tooltip").remove();
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`)
          .html(
            `<strong>Country:</strong> ${
              d.name
            }<br><strong>Population:</strong> ${
              Math.round((d.pop / 1000000) * 10) / 10
            } million`
          );
      })

      .on("mouseout", function () {
        d3.select(".tooltip").remove();
      });
  }

  const initialValue = 10;
  updateTopCountries(initialValue);

  g.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", `translate(0,${height})`);

  g.append("g")
    .attr("class", "axis axis-y")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s")))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("");

  d3.select("#slider").on("input", function () {
    const value = +this.value;
    updateTopCountries(value);
  });
});
