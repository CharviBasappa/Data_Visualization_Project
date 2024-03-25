const margin = { top: 20, right: 20, bottom: 30, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

const svg = d3
  .select(".bar_chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("background", "rgba(255, 255, 255, 0.9)")
  .style("border", "solid 1px #000")
  .style("border-radius", "5px")
  .style("padding", "10px")
  .style("pointer-events", "none")
  .style("display", "none");

let currentColor = "steelblue";

function updateChart(selectedCount, color = currentColor) {
  d3.csv("data/world_population.csv").then((data) => {
    data.forEach((d) => {
      d.pop = +d.pop;
    });

    const selectedData = data
      .sort((a, b) => b.pop - a.pop)
      .slice(0, selectedCount);

    const xScale = d3
      .scaleBand()
      .range([0, width])
      .padding(0.1)
      .domain(selectedData.map((d) => d.name));
    const yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(selectedData, (d) => d.pop)])
      .nice();

    svg.selectAll(".bar").remove();
    svg.select(".x-axis").remove();
    svg.select(".y-axis").remove();

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

    svg
      .selectAll(".bar")
      .data(selectedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.name))
      .attr("y", (d) => yScale(d.pop))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.pop))
      .attr("fill", color)
      .on("mouseover", (event, d) => {
        const populationInMillions = Math.round((d.pop / 1000000) * 10) / 10;
        tooltip
          .style("display", "block")
          .style("opacity", 1)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 15}px`)
          .html(
            `<strong>Country:</strong> ${d.name}<br><strong>Population:</strong> ${populationInMillions} million`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 15}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0).style("display", "none");
      });
  });
}

function changeColor(color) {
  currentColor = color;
  const selectedCount = document.getElementById("dataRange").value;
  updateChart(selectedCount, color);
}

window.updateChart = updateChart;
window.changeColor = changeColor;

updateChart(10);

const slider = document.getElementById("dataRange");
slider.oninput = function () {
  const selectedCount = this.value;
  document.getElementById("dataValue").innerHTML = selectedCount;
  updateChart(selectedCount);
};
