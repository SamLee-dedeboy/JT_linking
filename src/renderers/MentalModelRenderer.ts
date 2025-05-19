import * as d3 from "d3"
export class MentalModelRenderer {
    svgId: string;
    width: number = 1000
    height: number = 1000
    handleClick: Function
    simulation: any
    constructor(svgId: string, handleClick: Function) {
        this.svgId = svgId
        this.handleClick = handleClick
    }

    init() {
        const svg = d3.select(`#${this.svgId}`)
        const regions = svg.append("g").attr("class", "region")
        const bubble_group = svg.append("g").attr("class", "bubble_group")
        const labels_group = svg.append("g").attr("class", "labels_group")
        const contour_path_group = svg.append("g").attr("class", "contour-path-group")
        this.width = +svg.node().getBoundingClientRect().width
        this.height = +svg.node().getBoundingClientRect().height
        svg.attr("viewBox", `0 0 ${this.width} ${this.height}`)
        regions.append("rect").attr("class", "top_region")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.width)
        .attr("height", this.height/2)
        .attr("fill", "oklch(98.2% 0.018 155.826)")
      regions.append("rect").attr("class", "bottom_region")
        .attr("x", 0)
        .attr("y", this.height/2)
        .attr("width", this.width)
        .attr("height", this.height/2)
        .attr("fill", "oklch(98.7% 0.022 95.277)")
      regions.append("text").attr("class", "top_region_label")
        .attr("x", this.width/2)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .attr("font-size", 20)
        .attr("font-style", "italic")
        .attr("fill", "oklch(45.3% 0.124 130.933)")
        .attr("pointer-events", "none")
        .attr("font-family", "monospace")
        .text("Impacts Salinity")
      regions.append("text").attr("class", "bottom_region_label")
        .attr("x", this.width/2)
        .attr("y", this.height - 10)
        .attr("text-anchor", "middle")
        .attr("font-style", "italic")
        .attr("dominant-baseline", "bottom")
        .attr("font-size", 20)
        .attr("fill", "oklch(41.4% 0.112 45.904)")
        .attr("pointer-events", "none")
        .attr("font-family", "monospace")
        .text("Impacted by Salinity")
    }

    update(_nodes_data: Record<string, number>, callback=(d)=>{}) {
        console.log("mental model data", JSON.parse(JSON.stringify(_nodes_data)));
        _nodes_data["Salinity"] = 0;
        const nodes = Object.entries(_nodes_data)
        const svg = d3.select(`#${this.svgId}`)
        const bubble_group = svg.select("g.bubble_group")
        const radiusScale = d3.scaleSqrt().domain([0, d3.max(nodes, d => d[1])]).range([10, 50])
        const fontScale = d3.scaleSqrt().domain([0, d3.max(nodes, d => d[1])]).range([10, 15])
        const circles = bubble_group.selectAll("circle")
            .data(nodes, (d) => d[0])
            .join(
              enter => enter.append("circle")
                .attr("class", "bubble")
                .classed("is_center", d => d[0] === "Salinity")
                .attr("fill", "lightgray")
                .attr("fill-opacity", 0.8)
                .attr("cursor", "pointer")
                .on("mouseover", function() {
                    d3.select(this).classed("hovered", true)
                })
                .on("mouseout", function() {
                    d3.select(this).classed("hovered", false)
                })
                .on("click", (e, d) => {
                    this.handleClick(d)
                })
                .attr("cx", (d) => d.x || this.width/2)
                .attr("cy", (d) => d.y || this.height/2)
                .attr("r", 0)
                .transition().duration(300).delay(300)
                .attr("r", d => d.r = d[0] === "Salinity"? radiusScale(50): radiusScale(d[1])),
              update => update.transition().duration(100)
                .attr("cx", (d) => d.x || this.width/2)
                .attr("cy", (d) => d.y || this.height/2),
              exit => exit.transition().duration(300).attr("r", 0).remove()
            )
        const node_labels = svg.select("g.labels_group").selectAll("text")
            .data(nodes, (d) => d[0])
            .join("text")
            .attr("class", "bubble_label")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", (d) => d[0] === "Salinity"? fontScale(50) : fontScale(d[1]))
            .attr("fill", "black")
            .attr("pointer-events", "none")
            .each(function(d) {
              const text = d3.select(this);
              text.selectAll("*").remove();
              text.append("tspan")
                .text(d => d[0])
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", d.x)
                .attr("y", d.y)
                .attr("dy", (d) => d[0] === "Salinity"? 0: "-0.6em")
                .attr("font-family", "monospace")
              if (d[0] === "Salinity") return
              text.append("tspan")
                .text(d => `(${d[1]})`)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", d.x)
                .attr("y", d.y)
                .attr("dy", "0.6em")
            })
        
        // update force
        const forceNode = d3.forceManyBody();
        this.simulation = d3
        .forceSimulation(nodes)
        .alphaMin(0.1)
        // .force("parent_x", d3.forceX((d) => d.parent_x).strength(0.1))  
        // .force("parent_y", d3.forceY((d) => d.parent_y).strength(0.1))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2).strength(0.05))
        .force("charge", forceNode.distanceMin(20))
        .force("collide", d3.forceCollide((d) => 1.1*radiusScale(d[1])))
        .on("tick", () => {
          circles
            .attr(
              "cx",
              (d) =>
                (d.x = clip(d.x, [
                  0 + radiusScale(d[1]),
                  this.width - radiusScale(d[1]),
                ])),
            )
            .attr(
              "cy",
              (d) =>
                (d.y = clip(d.y, [
                  0 + radiusScale(d[1]) + 5, // 5 is for the label
                  this.height - radiusScale(d[1]) - 5,
                ])),
            ).classed("is_top", d => d.is_top = d.y < this.height/2)
            .classed("is_bottom", d => d.is_bottom = d.y > this.height/2)
          circles.filter((d) => d[0] === "Salinity")
            .classed("is_top", false)
            .classed("is_bottom", false)
            .attr("cx", (d) => d.x = this.width/2)
            .attr("cy", (d) => d.y = this.height/2)
          node_labels
            .selectAll("tspan")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y);
        //   this.updateContour(bubble_data)
        })
        .on("end", () => {
          console.log("simulation end", { _nodes_data });
        //   callback(bubble_data)
        })
        circles.call(
          d3
            .drag()
            .on("start", (e) => dragstarted(e, this.simulation, nodes))
            .on("drag", (e) => dragged(e))
            .on("end", (e) => dragended(e, this.simulation, nodes))
        );
    }
    highlightSelectBubble(bubble_data) {
      console.log("highlightSelectBubble", bubble_data)
      const svg = d3.select(`#${this.svgId}`)
      svg.selectAll("circle.bubble").classed("selected", false)
      .filter((d) => bubble_data.id === d.id).classed("selected", true)
    }
}
function dragstarted(event, simulation, nodes) {
  if (!event.active) simulation.alphaTarget(0.2).restart();
  document.querySelector(".tooltip")!.style.display = "none"
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
  nodes.filter(d => d.id === event.subject.id).classed("mousedown", true)
}

// Update the subject (dragged node) position during drag.
function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
  // event.subject.x = event.x;
  // event.subject.y = event.y;
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function dragended(event, simulation, nodes) {
  console.log("dragended", event.active)
  if (!event.active) simulation.stop();
  event.subject.fx = null;
  event.subject.fy = null;
  nodes.filter(d => d.id === event.subject.id).classed("mousedown", false)
}

function clip(x, range) {
    return Math.max(Math.min(x, range[1]), range[0]);
  }
