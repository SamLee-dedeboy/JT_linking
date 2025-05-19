import * as d3 from "d3"

type NodeData = {
  node: string;
  codes: string[];
}
export class ExhibitionMMRenderer {
    svgId: string;
    width: number = 1000
    height: number = 1000
    handleClick: Function
    handleUpdateNodeCategory: Function
    simulation: any
    constructor(svgId: string, handleClick: Function) {
        this.svgId = svgId
        this.handleClick = handleClick
    }

    init(handleUpdateNodeCategory) {
      this.handleUpdateNodeCategory = handleUpdateNodeCategory
        const svg = d3.select(`#${this.svgId}`)
        const regions = svg.append("g").attr("class", "region")
        const links_group = svg.append("g").attr("class", "links_group")
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
        svg.append("circle")
          .attr("class", "bubble")
          .classed("is_center", true)
          .attr("fill", "oklch(95.6% 0.045 203.388)")
          .attr("stroke", "oklch(82.8% 0.111 230.318)")
          .attr("stroke-width", 2)
          .attr("cx", this.width/2)
          .attr("cy", this.height/2)
          .attr("r", 80)
        svg.append("text")
          .attr("class", "bubble_label")
          .attr("x", this.width/2)
          .attr("y", this.height/2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", 20)
          .attr("pointer-events", "none")
          .attr("font-family", "monospace")
          .text("Salinity")
    }

    update(_node_data: NodeData[], callback=(d)=>{}) {
        let node_data = JSON.parse(JSON.stringify(_node_data))
        console.log("transcribed data", JSON.parse(JSON.stringify(node_data)));
        const svg = d3.select(`#${this.svgId}`)
        const bubble_group = svg.select("g.bubble_group")
        // const radiusScale = d3.scaleSqrt().domain([0, d3.max(nodes, d => d[1])]).range([10, 50])
        // const fontScale = d3.scaleSqrt().domain([0, d3.max(nodes, d => d[1])]).range([10, 15])
        const r = 60
        const font_size = 15
        const self = this

        const circles = bubble_group.selectAll("circle")
            .data(node_data, (d) => d.node)
            .join(
              enter => enter.append("circle")
                .attr("class", "bubble")
                .attr("fill", "lightgray")
                // .attr("fill-opacity", 0.8)
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
                .attr("r", r),
              update => update.transition().duration(100)
                .attr("cx", (d) => d.x || this.width/2)
                .attr("cy", (d) => d.y || this.height/2),
              exit => exit.transition().duration(300).attr("r", 0).remove()
            )
        const node_labels = svg.select("g.labels_group").selectAll("text")
            .data(node_data, (d) => d.node)
            .join("text")
            .attr("class", "bubble_label")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", font_size)
            .attr("fill", "black")
            .attr("pointer-events", "none")
            .attr("font-family", "monospace")
            .text(d => d.node)
        const links = svg.select("g.links_group").selectAll("line")
            .data(node_data, (d) => d.node)
            .join("line")
            .attr("class", "bubble_link")
            .attr("x1", (d) => d.x)
            .attr("y1", (d) => d.y)
            .attr("x2", this.width / 2)
            .attr("y2", this.height / 2)
            .attr("stroke", "black")  
            .attr("stroke-width", 4)
            .attr("pointer-events", "none")
        // update force
        const forceNode = d3.forceManyBody();
        this.simulation = d3
        .forceSimulation(node_data)
        .alphaMin(0.1)
        // .force("parent_x", d3.forceX((d) => d.parent_x).strength(0.1))  
        // .force("parent_y", d3.forceY((d) => d.parent_y).strength(0.1))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2).strength(0.05))
        .force("charge", forceNode.distanceMin(20))
        .force("collide", d3.forceCollide(r))
        .on("tick", () => {
          let node_categories = {}
          circles
            .attr(
              "cx",
              (d) =>
                (d.x = clip(d.x, [
                  0 + r,
                  this.width - r,
                ])),
            )
            .attr(
              "cy",
              (d) =>
                (d.y = clip(d.y, [
                  0 + r + 5, // 5 is for the label
                  this.height - r - 5,
                ])),
            )
            .each(function(d) {
              const is_top = d.y < self.height/2
              const is_bottom = d.y > self.height/2 
              self.handleUpdateNodeCategory(d.node, is_top, is_bottom)
              d3.select(this).classed("is_top", is_top).classed("is_bottom", is_bottom)
            })
          node_labels
            // .selectAll("tspan")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y);
          links.attr("x1", (d) => d.x)
            .attr("y1", (d) => d.y)
            .classed("is_top", d => d.is_top = d.y < this.height/2)
            .classed("is_bottom", d => d.is_bottom = d.y > this.height/2)
        //   this.updateContour(bubble_data)
        })
        .on("end", () => {
          console.log("simulation end", { node_data });
        //   callback(bubble_data)
        })
        circles.call(
          d3
            .drag()
            .on("start", (e) => dragstarted(e, this.simulation, node_data))
            .on("drag", (e) => dragged(e))
            .on("end", (e) => dragended(e, this.simulation, node_data))
        );
    }

    updateLoading(loading) {
      const svg = d3.select(`#${this.svgId}`)
      svg.selectAll("circle.is_center").classed("loading", loading)
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
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
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
}

function clip(x, range) {
    return Math.max(Math.min(x, range[1]), range[0]);
  }
