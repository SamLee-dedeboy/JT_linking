import * as d3 from "d3"
const center = 1.8/3;
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
          .attr("height", this.height* center)
          .attr("fill", "#cccccc")
          .attr("opacity", 0.1)
        regions.append("rect").attr("class", "bottom_region")
          .attr("x", 0)
          .attr("y", this.height* center)
          .attr("width", this.width)
          .attr("height", this.height* (1- center))
          .attr("fill", "#ffffff")
          .attr("opacity", 0.1)
        regions.append("text").attr("class", "top_region_label")
          .classed("jt-body-3", true)
          .attr("x", this.width/2)
          .attr("y", 10)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "hanging")
          .attr("font-size", 20)
          .attr("fill", "#a2bffd")
          .attr("pointer-events", "none")
          .attr("font-family", "monospace")
          .text("Factors Impacting Salinity")
        regions.append("text").attr("class", "bottom_region_label")
          .classed("jt-body-3", true)
          .attr("x", this.width/2)
          .attr("y", this.height - 15)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "bottom")
          .attr("font-size", 20)
          .attr("fill", "#0088AD")
          .attr("pointer-events", "none")
          // .attr("font-family", "")
          .text("Factors Impacted by Salinity")
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
          .attr("cy", this.height * center)
          .attr("r", 80)
        svg.append("text")
          .attr("class", "bubble_label")
          .classed("jt-body-3", true)
          .attr("x", this.width/2)
          .attr("y", this.height * center)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", 21)
          .attr("pointer-events", "none")
          // .attr('fill', "#253439")
          // .attr('fill', "#eeeeee")
          .attr("fill", "#2c4b56")
          .text("Salinity")

        // top line
        svg.append("defs")
          .append("marker")
          .attr("id", "arrowhead")
          .attr("viewBox", "0 0 10 10")
          .attr("refX", 10)
          .attr("refY", 5)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M 0 0 L 10 5 L 0 10 Z")
          .attr("fill", "#a2bffd");
        
        svg.append("line")
          .attr("x1", 0)
          .attr("y1", 5)
          .attr("x2", this.width)
          .attr("y2", 5)
          .attr("stroke", "#a2bffd")
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead)");
          // Add label "Natural" at the start of the line
          svg.append("text")
            .classed("jt-body-3", true)
            .attr("x", 5) // Slightly offset from the start of the line
            .attr("y", 25) // Position below the line
            .attr("text-anchor", "start")
            .attr("font-size", 18)
            .attr("fill", "#a2bffd")
            .text("Natural");
          
          // Add label "Human" at the end of the line
          svg.append("text")
            .classed("jt-body-3", true)
            .attr("x", this.width - 5) // Slightly offset from the end of the line
            .attr("y", 25) // Position below the line
            .attr("text-anchor", "end")
            .attr("font-size", 18)
            .attr("fill", "#a2bffd")
            .text("Human");


            // bottom line
        svg.append("defs")
          .append("marker")
          .attr("id", "arrowhead-bot")
          .attr("viewBox", "0 0 10 10")
          .attr("refX", 10)
          .attr("refY", 5)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M 0 0 L 10 5 L 0 10 Z")
          .attr("fill", "#0088AD");
            svg.append("line")
            .attr("x1", 0)
            .attr("y1", this.height - 5)
            .attr("x2", this.width)
            .attr("y2", this.height - 5)
            .attr("stroke", "#0088AD")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead-bot)");
            // Add label "Natural" at the start of the line
            svg.append("text")
              .classed("jt-body-3", true)
              .attr("x", 5) // Slightly offset from the start of the line
              .attr("y", this.height - 15) // Position below the line
              .attr("text-anchor", "start")
              .attr("font-size", 18)
              .attr("fill", "#0088AD")
              .text("Natural");
            
            // Add label "Human" at the end of the line
            svg.append("text")
              .classed("jt-body-3", true)
              .attr("x", this.width - 5) // Slightly offset from the end of the line
              .attr("y", this.height - 15) // Position below the line
              .attr("text-anchor", "end")
              .attr("font-size", 18)
              .attr("fill", "#0088AD")
              .text("Human");
    }

    update(_nodes_data: Record<string, number>, codebook: any[], code_tsne: Record<string, number>, callback=(d)=>{}) {
        const nodes_data = Object.entries(_nodes_data)
        const node_types = codebook.reduce((acc, item) => {
            acc[item.name] = item.type
            return acc
        }, {})
        // let nodes_data = JSON.parse(JSON.stringify(_nodes_data));
        // nodes_data["Salinity"] = 80;
        console.log("mental model data", nodes_data)
        const svg = d3.select(`#${this.svgId}`)
        const bubble_group = svg.select("g.bubble_group")
        const radiusScale = d3.scaleSqrt().domain([0, d3.max(nodes_data, d => d[1])]).range([5, 65])
        const fontScale = d3.scaleSqrt().domain([0, d3.max(nodes_data, d => d[1])]).range([12, 18])
        const nodes = nodes_data.concat([["Salinity", 80]])
        const classification_force_position_y = {
          "impacts salinity": this.height * center / 2,
          "impacted by salinity":  this.height * center + (this.height * (1 - center) / 2),
        }
        const circles = bubble_group.selectAll("circle")
          .data(nodes, (d) => d[0])
            .join(
              enter => enter.append("circle")
                .attr("class", "bubble")
                .classed("is_center", d => d[0] === "Salinity")
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
                // .attr("cx", (d) => d.x = this.width/2)
                .attr("cx", (d) => d.x = code_tsne[d[0]] * this.width || this.width/2)
                .attr("cy", (d) => d.y = classification_force_position_y[node_types[d[0]]] || this.height*center)
                .attr("r", 0)
                .transition().duration(300).delay(300)
                .attr("r", d => d.r = d[0] === "Salinity"? 80: radiusScale(d[1])),
                // .attr("r", d => d.r = d[0] === "Salinity"?  50: radiusScale(d[1])),
              update => update.transition().duration(100)
                // .attr("cx", (d) => d.x || this.width/2)
                .attr("cx", (d) => d.x = code_tsne[d[0]] * this.width || this.width/2)
                .attr("cy", (d) => d.y = classification_force_position_y[node_types[d[0]]] || this.height*center)
                .attr("r", d => d.r = d[0] === "Salinity"? 80: radiusScale(d[1])),
              exit => exit.transition().duration(300).attr("r", 0).remove()
            )
        console.log(node_types, classification_force_position_y[node_types[nodes[1][0]]])
        const node_labels = svg.select("g.labels_group").selectAll("text")
            .data(nodes, (d) => d[0])
            .join("text")
            .attr("class", "bubble_label")
            .classed("jt-body-2", true)
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", (d) => d[0] === "Salinity"? fontScale(50) : fontScale(d[1]))
            .attr("fill", "white")
            .attr("pointer-events", "none")
            .text((d) => d[0])
            .each(function(d) {
              wrap(d3.select(this), d.r*2)
              const line_num = d3.select(this).selectAll("tspan").nodes().length 
              d3.select(this).append("tspan")
                .text(`(${d[1]})`)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", d.x)
                .attr("y", d.y)
                .attr("dy", `-${((line_num+1)/2) * 1.2}em`)
            })
            // .each(function(d) {
            //   const text = d3.select(this);
            //   text.selectAll("*").remove();
            //   text.append("tspan")
            //     .text(d => d[0])
            //     .attr("text-anchor", "middle")
            //     .attr("dominant-baseline", "middle")
            //     .attr("x", d.x)
            //     .attr("y", d.y)
            //     .attr("dy", (d) => d[0] === "Salinity"? 0: "-0.6em")
            //     .attr("font-family", "monospace")
            //   if (d[0] === "Salinity") return
            //   text.append("tspan")
            //     .text(d => `(${d[1]})`)
            //     .attr("text-anchor", "middle")
            //     .attr("dominant-baseline", "middle")
            //     .attr("x", d.x)
            //     .attr("y", d.y)
            //     .attr("dy", "0.6em")
            // })

        const links = svg.select("g.links_group").selectAll("line")
            .data(nodes_data.filter(d => d[0] !== "Salinity"), (d) => d[0])
            .join("line")
            .attr("class", "link")
            .attr("x1", (d) => d.x || this.width/2)
            .attr("y1", (d) => d.y || this.height * center)
            .attr("x2", this.width/2)
            .attr("y2", this.height*center)
            .attr("stroke-width", 1.5)
            .attr("stroke", "#26414b")
            .attr("stroke-opacity", 0.5)
        // update force
        const forceNode = d3.forceManyBody();
        this.simulation = d3
        .forceSimulation(nodes)
        .alphaMin(0.03)
        // .alphaMin(0.8)
        // .force("parent_x", d3.forceX((d) => d.parent_x).strength(0.1))  
        // .force("parent_y", d3.forceY((d) => d.parent_y).strength(0.1))
        .force("tsne_x", d3.forceX((d) => code_tsne[d[0]] * this.width || this.width/2).strength(0.1))
        .force("clf_y", d3.forceY((d) => classification_force_position_y[node_types[d[0]]] || this.height * center).strength(0.08))
        .force("center_x", d3.forceX(this.width/2).strength(0.02))
        .force("center_y", d3.forceY(this.height*center).strength(0.01))
        // .force("clf_y", d3.forceY((d) => classification_force_position_y[node_types[d[0]]] || this.height * center).strength(0.08))
        // .force("center", d3.forceCenter(this.width / 2, this.height * center).strength(0.02))
        .force("charge", forceNode.distanceMin(30))
        .force("collide", d3.forceCollide((d) => 1.15*d.r))
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
                  0 + radiusScale(d[1]) + 30, // 5 is for the label
                  this.height - radiusScale(d[1]) - 30,
                ])),
            ).classed("is_top", d => d.is_top = d.y < this.height*center)
            .classed("is_bottom", d => d.is_bottom = d.y > this.height*center)
          circles.filter((d) => d[0] === "Salinity")
            .classed("is_top", false)
            .classed("is_bottom", false)
            .attr("cx", (d) => d.x = this.width/2)
            .attr("cy", (d) => d.y = this.height* center)
          node_labels
            .selectAll("tspan")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y);
          links.attr("x1", (d) => d.x || this.width/2)
            .attr("y1", (d) => d.y || this.height* center)
            .classed("is_top", d => d.is_top = d.y < this.height*center)
            .classed("is_bottom", d => d.is_bottom = d.y > this.height*center)
            
        //   this.updateContour(bubble_data)
        })
        .on("end", () => {
          console.log("simulation end", { _nodes_data });
        //   callback(bubble_data)
        })
        // circles.call(
        //   d3
        //     .drag()
        //     .on("start", (e) => dragstarted(e, this.simulation, nodes))
        //     .on("drag", (e) => dragged(e))
        //     .on("end", (e) => dragended(e, this.simulation, nodes))
        // );
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