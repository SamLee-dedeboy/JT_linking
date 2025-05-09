import * as d3 from "d3"
import concaveman from "concaveman";
import {
  BSplineShapeGenerator,
  BubbleSet,
  PointPath,
  ShapeSimplifier,
} from 'bubblesets';
import { bubble_color } from "constants/colors";
export class CodeBubbleRenderer {
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
        const bubble_group = svg.append("g").attr("class", "bubble_group")
        const labels_group = svg.append("g").attr("class", "labels_group")
        const contour_path_group = svg.append("g").attr("class", "contour-path-group")
        this.width = +svg.node().getBoundingClientRect().width
        this.height = +svg.node().getBoundingClientRect().height
        svg.attr("viewBox", `0 0 ${this.width} ${this.height}`)
    }

    update(bubble_data: any, callback=(d)=>{}) {
        console.log("bubble_data", JSON.parse(JSON.stringify(bubble_data)));
        const svg = d3.select(`#${this.svgId}`)
        const bubble_group = svg.select("g.bubble_group")
        const radiusScale = d3.scaleSqrt().domain([0, d3.max(bubble_data, d => d.data.participants.length)]).range([10, this.width/8])
        const fontScale = d3.scaleSqrt().domain([0, d3.max(bubble_data, d => d.data.participants.length)]).range([10, 20])
        const sub_categories = ["Drivers", "Strategies", "Value", "Governance"]
        const nodes = bubble_group.selectAll("circle")
            .data(bubble_data, (d) => d.id)
            .join(
              enter => enter.append("circle")
                .attr("class", "bubble")
                .attr("fill", d => bubble_color(d.data.name.split("\\").at(0)))
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
                .attr("r", d => d.r = radiusScale(d.data.participants.length)),
              update => update.transition().duration(100)
                .attr("cx", (d) => d.x || this.width/2)
                .attr("cy", (d) => d.y || this.height/2),
              exit => exit.transition().duration(300).attr("r", 0).remove()
            )
        const node_labels = svg.select("g.labels_group").selectAll("text")
            .data(bubble_data, (d) => d.data.id)
            .join("text")
            .attr("class", "bubble_label")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", (d) => fontScale(d.data.participants.length))
            .attr("fill", "black")
            .attr("pointer-events", "none")
            .each(function(d) {
              const text = d3.select(this);
              text.selectAll("*").remove();
              text.append("tspan")
                .text(d => d.data.name.split("\\").at(-1))
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", d.x)
                .attr("y", d.y)
                .attr("dy", "-0.6em")
                .attr("font-family", "monospace")
              text.append("tspan")
                .text(d => `(${d.data.participants.length})`)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", d.x)
                .attr("y", d.y)
                .attr("dy", "0.6em")
            })
        
        // update force
        const forceNode = d3.forceManyBody();
        this.simulation = d3
        .forceSimulation(bubble_data)
        .alphaMin(0.1)
        .force("parent_x", d3.forceX((d) => d.parent_x).strength(0.1))  
        .force("parent_y", d3.forceY((d) => d.parent_y).strength(0.1))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2).strength(0.05))
        .force("charge", forceNode.distanceMin(20))
        .force("collide", d3.forceCollide((d) => 1.1*radiusScale(d.data.participants.length)))
        .on("tick", () => {
          nodes
            .attr(
              "cx",
              (d) =>
                (d.x = clip(d.x, [
                  0 + radiusScale(d.data.participants.length),
                  this.width - radiusScale(d.data.participants.length),
                ])),
            )
            .attr(
              "cy",
              (d) =>
                (d.y = clip(d.y, [
                  0 + radiusScale(d.data.participants.length) + 5, // 5 is for the label
                  this.height - radiusScale(d.data.participants.length) - 5,
                ])),
            );
          node_labels
            .selectAll("tspan")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y);
          this.updateContour(bubble_data)
        })
        .on("end", () => {
          console.log("simulation end", { bubble_data });
          callback(bubble_data)
        })
        nodes.call(
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
 updateContour(bubble_data) {
  const pad = 0;
  // bubbles can be reused for subsequent runs or different sets of rectangles
  const bubbles = new BubbleSet();
  // rectangles needs to be a list of objects of the form { x: 0, y: 0, width: 0, height: 0 }
  // lines needs to be a list of objects of the form { x1: 0, x2: 0, y1: 0, y2: 0 }
  // lines can be null to infer lines between rectangles automatically
  const rects = bubble_data.reduce((group, d) => {
    const parent = d.id.split("\\").at(0)
    if(!group[parent]) {
      group[parent] = []
    }
    const offset = 1.2
    const diagonal_offset = 1.2*Math.sqrt(2) / 2
    group[parent] = group[parent].concat([
      [d.x - d.r * diagonal_offset, d.y - d.r * diagonal_offset],
      [d.x - d.r * diagonal_offset, d.y + d.r * diagonal_offset],
      [d.x + d.r * diagonal_offset, d.y + d.r * diagonal_offset],
      [d.x + d.r * diagonal_offset, d.y - d.r * diagonal_offset],
      [d.x, d.y - d.r * offset],
      [d.x - d.r * offset, d.y],
      [d.x, d.y + d.r * offset],
      [d.x + d.r * offset, d.y],
    ])
   
    return group
  }, {})
  console.log("bubble_data", rects)
  const contour_paths = Object.keys(rects).map((key) => {
    // if(key !== "Drivers") return {id: key, path: ""}
    // const bubbles = new BubbleSet();
    // const rect = BubbleSet.addPadding(rects[key], pad);
    // const list = bubbles.createOutline(
    //   rect,
    //   [],
    //   null /* lines */
    // );
    // const outline = new PointPath(list).transform([
    //   new circleShapeGenerator(),  // smoothes the output shape using b-splines
    // ]);
    // console.log("outline", list)
    const polygons = concaveman(rects[key], 0.5, 100);

    d3.select(`#${this.svgId}`)
    .selectAll(".test-circle")
    .data(rects[key])
    .join("circle")
    .attr("class", "test-circle")
    .attr("cx", (d) => d[0])
    .attr("cy", (d) => d[1])
    .attr("r", 0)
    .attr("fill", "red")
    .attr("opacity", 0.5)
    const path_generator = d3.line()
    .x((p) => p[0])
    .y((p) => p[1])
    // .curve(d3.curveLinear);
    // .curve(d3.curveBasis);
    .curve(d3.curveCatmullRom);
    const outline = path_generator(polygons).toString();
    return {
      id: key,
      path: outline,
    }
  })
  d3.select(`#${this.svgId}`).select(".contour-path-group")
    .selectAll(".contour-path")
    .data(contour_paths)
    .join("path")
    .attr("class", "contour-path")
    .attr('d', (d) => d.path)
    .attr("fill", d => bubble_color(d.id.split("\\").at(0)))
    .attr("opacity", 0.2)
    .attr("pointer-events", "none")
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
