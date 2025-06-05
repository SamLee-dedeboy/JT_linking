import * as d3 from "d3"
import { parse } from "svelte/compiler";

type NodeData = {
  node: string;
  classification: string;
  // codes: string[];
  x?: number,
  y?: number,
  r?: number,
}
const center_radius = 60
const center_font = 15
export class ExhibitionMMRenderer {
    svgId: string = "ExhibitionMMRenderer";
    width: number = 1000
    height: number = 1000
    node_classification: Record<string, string> = {}
    handleClick: Function
    handleUpdateNodeCategory: Function = () => {}
    simulation: any
    constructor(handleClick: Function, handleUpdateNodeCategory: Function) {
        this.handleClick = handleClick
        this.handleUpdateNodeCategory = handleUpdateNodeCategory
    }

    init(svgId: string) {
      this.svgId = svgId
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
          .attr("fill", "#cccccc")
          .attr("opacity", 0.1)
        regions.append("rect").attr("class", "bottom_region")
          .attr("x", 0)
          .attr("y", this.height/2)
          .attr("width", this.width)
          .attr("height", this.height/2)
          .attr("fill", "#ffffff")
          .attr("opacity", 0.1)
        regions.append("text").attr("class", "top_region_label")
          .classed("jt-body-3", true)
          .attr("x", this.width/2)
          .attr("y", 10)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "hanging")
          .attr("font-size", center_font)
          .attr("fill", "#a2bffd")
          .attr("pointer-events", "none")
          // .attr("font-family", "monospace")
          .text("Impacts Salinity")
        regions.append("text").attr("class", "bottom_region_label")
          .classed("jt-body-3", true)
          .attr("x", this.width/2)
          .attr("y", this.height - 10)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "bottom")
          .attr("font-size", center_font)
          .attr("fill", "#0088AD")
          .attr("pointer-events", "none")
          // .attr("font-family", "")
          .text("Impacted by Salinity")
        svg.append("circle")
          .attr("class", "bubble")
          .classed("is_center", true)
          // .attr("fill", "oklch(95.6% 0.045 203.388)")
          .attr("fill", "#74b1d2")
          .attr("filter", "drop-shadow(0px 0px 1.5px rgba(255, 255, 255, 1))")
          .attr("stroke", "#26414b")
          // .attr("stroke", "#5d8397")
          .attr("stroke-width", 6)
          .attr("cx", this.width/2)
          .attr("cy", this.height/2)
          .attr("r", center_radius)
        svg.append("text")
          .attr("class", "bubble_label")
          .classed("jt-body-3", true)
          .attr("x", this.width/2)
          .attr("y", this.height/2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", center_font)
          .attr("pointer-events", "none")
          // .attr('fill', "#253439")
          // .attr('fill', "#eeeeee")
          .attr("fill", "#2c4b56")
          .text("Salinity")
    }
    update_node_classification(node_classifications: { node: string, classification:string}[]) {
      this.node_classification = node_classifications.reduce((acc, d) => {
        acc[d.node] = d.classification
        return acc
      }
      , {})
      // console.log("node_classification", this.node_classification)
    }

    update(_node_data: NodeData[], _links_data: [string, string][] | undefined=undefined, callback=(d)=>{}) {
        // let node_data = JSON.parse(JSON.stringify(_node_data))
        // const salinity_node = {
        //   node: "salinity",
        //   r: 80,
        //   x: this.width/2, 
        //   y: this.height/2,
        // }
        // node_data.push(salinity_node)
        let node_dict: Record<string, NodeData> = _node_data.reduce((acc, d) => {
          acc[d.node] = JSON.parse(JSON.stringify(d))
          return acc
        }, {})
        node_dict["salinity"] = {
          node: "salinity",
          classification: "impacts salinity",
          r: center_radius,
          x: this.width/2, 
          y: this.height/2,
        }
        let links_data;
        if(_links_data === undefined) {
          links_data = Object.values(node_dict).map((d) => [d.node, "salinity"])
        } else {
          links_data = JSON.parse(JSON.stringify(_links_data))
        }

        // console.log("transcribed data", Object.values(node_dict), _links_data, this.svgId)
        const svg = d3.select(`#${this.svgId}`)
        const bubble_group = svg.select("g.bubble_group")
        // const radiusScale = d3.scaleSqrt().domain([0, d3.max(nodes, d => d[1])]).range([10, 50])
        // const fontScale = d3.scaleSqrt().domain([0, d3.max(nodes, d => d[1])]).range([10, 15])
        const r = 35
        const font_size = 12
        const self = this

        const classification_force_position_y = {
          "impacts salinity": this.height / 4,
          "impacted by salinity": 3 * this.height / 4 ,
        }
        const circles = bubble_group.selectAll("circle")
            .data(Object.values(node_dict), (d) => d.node)
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
                    this.handleClick(d.node)
                })
                .attr("cx", (d) => d.x = this.width/2)
                .attr("cy", (d) => d.y = classification_force_position_y[this.node_classification[d.node]] || this.height/2)
                .attr("r", 0)
                .transition().duration(300).delay(300)
                .attr("r", (d) => d.r = d.r || r),
              update => update.transition().duration(100)
                .attr("cx", (d) => d.x = d.x || this.width/2)
                .attr("cy", (d) => d.y = d.y || classification_force_position_y[this.node_classification[d.node]] || this.height/2)
                .attr("r", (d) => d.r = d.r || r),
              exit => exit.transition().duration(300).attr("r", 0).remove()
            )
        const node_labels = svg.select("g.labels_group").selectAll("text")
            .data(Object.values(node_dict), (d) => d.node)
            .join("text")
            .attr("class", "bubble_label")
            .classed("jt-body-2", true)
            .attr("x", (d) => d.x = this.width/2)
            .attr("y", (d) => d.y = this.height/2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", font_size)
            .attr("fill", "white")
            .attr("pointer-events", "none")
            // .attr("font-family", "monospace")
            .text(d => d.node === "salinity" ? "" : d.node)
            .call(wrap, r * 2)
        const links = svg.select("g.links_group").selectAll("line")
            .data(links_data, (d) => `${d[0]}-${d[1]}`)
            .join("line")
            .attr("class", "bubble_link")
            .attr("x1", (d) => node_dict[d[0]].x)
            .attr("y1", (d) => node_dict[d[0]].y)
            .attr("x2", (d) => node_dict[d[1]].x)
            .attr("y2", (d) => node_dict[d[1]].y)
            .attr("stroke", "#74b1d2")  
            .attr("stroke-width", 4)
            .attr("pointer-events", "none")
        // update force
        const forceNode = d3.forceManyBody();
        this.simulation = d3
        .forceSimulation(Object.values(node_dict))
        .alphaMin(0.05)
        // .force("clf_x", d3.forceX((d) => d.parent_x).strength(0.1))  
        .force("clf_y", d3.forceY((d) => classification_force_position_y[this.node_classification[d.node]] || this.height/2).strength(0.08))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2).strength(0.05))
        .force("charge", forceNode.distanceMin(20))
        .force("collide", d3.forceCollide((d) => 1.1 * d.r))
        .on("tick", () => {
          circles.filter(d => d.node !== "salinity")
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
                  0 + r + 30, // 30 is for the label
                  this.height - r - 30,
                ]))
            )
            .each(function(d) {
              const is_top = d.y < self.height/2
              const is_bottom = d.y > self.height/2 
              // self.handleUpdateNodeCategory(d.node, is_top, is_bottom)
              d3.select(this).classed("is_top", is_top).classed("is_bottom", is_bottom)
            })
          circles.filter(d => d.node === "salinity")
            .attr("cx", (d) => d.x = this.width/2)
            .attr("cy", (d) => d.y = this.height/2)
          node_labels
            .selectAll("tspan")
            .classed("is_top_text", d => d.is_top = d.y < this.height/2)
            .classed("is_bottom_text", d => d.is_bottom = d.y > this.height/2)
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
          links
          .attr("x1", (d) => node_dict[d[0]].x)
          .attr("y1", (d) => node_dict[d[0]].y)
          .attr("x2", (d) => node_dict[d[1]].x)
          .attr("y2", (d) => node_dict[d[1]].y)
            // .classed("is_top", d => d.y < this.height/2)
            // .classed("is_bottom", d => d.y > this.height/2)
        //   this.updateContour(bubble_data)
        })
        .on("end", () => {
          // console.log("simulation end", { node_dict });
          circles.each((d) => { 
            this.handleUpdateNodeCategory(d.node, d.is_top, d.is_bottom)
          })
        //   callback(bubble_data)
        })
        circles.call(
          d3
            .drag()
            .on("start", (e) => {
              // recalculate simulation
              this.simulation.force("clf_y", d3.forceY((d) => classification_force_position_y[this.node_classification[d.node]]).strength(0.08))
              dragstarted(e, this.simulation)
            })
            .on("drag", (e) => dragged(e))
            .on("end", (e, d) => {
              dragended(e, this.simulation)
              const is_top = d.y < this.height/2
              const is_bottom = d.y > this.height/2
              this.handleUpdateNodeCategory(d.node, is_top, is_bottom)
            })
        );
    }

    updateLoading(loading) {
      const svg = d3.select(`#${this.svgId}`)
      svg.selectAll("circle.is_center").classed("loading", loading)
    }

    highlightSelectBubble(bubble_data) {
      // console.log("highlightSelectBubble", bubble_data)
      const svg = d3.select(`#${this.svgId}`)
      svg.selectAll("circle.bubble").classed("selected", false)
      .filter((d) => bubble_data.id === d.id).classed("selected", true)
    }
}
function dragstarted(event, simulation) {
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
function dragended(event, simulation) {
  // console.log("dragended", event.active)
  if (!event.active) simulation.stop();
  event.subject.fx = null;
  event.subject.fy = null;
}

function clip(x, range) {
    return Math.max(Math.min(x, range[1]), range[0]);
  }

  // text longer than `width` will be in next line
function wrap(text, width) {
  text.each(function (d, i) {
      let text = d3.select(this)
      let words = text.text().split(/[\s-]+/).reverse(),
          word,
          line: any[] = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          x = d.x,
          y = d.y,
          dy = 0, //parseFloat(text.attr("dy")),
          tspan = text.text(null)
              .append("tspan")
              .attr("x", x)
              .attr("y", y)
              .attr("dy", dy + "em")
              .attr("text-anchor", "bottom")
              .attr("dominant-baseline", "central")
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node()!.getComputedTextLength() > width && line.length > 1) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan")
                  .attr("x", x)
                  .attr("y", y)
                  .attr("dy", ++lineNumber * lineHeight + dy + "em")
                  .attr("dominant-baseline", "central")
                  .text(word);
          }
        }
        const line_num = text.selectAll("tspan").nodes().length
        if(line_num > 1) {
          const offset = lineHeight * (line_num - 1) / 2
          text.selectAll("tspan").attr("dy", function() {
            const dy = parseFloat(d3.select(this).attr("dy"))
            return dy - offset + "em"
          })
          // text.selectAll("tspan").attr("dy", parseFloat(y) - em_to_px / 2 * lineHeight * (line_num - 1) / 2)
        }
  });
}