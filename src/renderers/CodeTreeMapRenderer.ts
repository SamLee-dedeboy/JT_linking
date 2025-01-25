import * as d3 from "d3"
export class CodeTreeMapRenderer {
    svgId: string;
    width: number = 1000
    height: number = 1000
    constructor(svgId: string) {
        this.svgId = svgId
    }

    init() {
        const svg = d3.select(`#${this.svgId}`)
        this.width = +svg.node().getBoundingClientRect().width
        this.height = +svg.node().getBoundingClientRect().height
        svg.attr("viewBox", `0 0 ${this.width} ${this.height}`)
    }
    
    update(data) {
        const svg = d3.select(`#${this.svgId}`)
        svg.selectAll("g").remove()
        const root = d3.treemap()
            .tile(d3.treemapBinary)
            .size([this.width, this.height])
            .padding(1)
            .round(true)
            (d3.hierarchy(data)
            .sum(d => d.data?.occurrences ||0)
            .sort((a, b) => b.value - a.value))
        const format = d3.format(",d");
        const sub_categories = data.children.map(d => d.id.split("/").at(-1))
        const color = d3.scaleOrdinal(sub_categories, d3.schemeTableau10);
        this.render(root.children, color, format)

    }
    render(nodes, color, format) {
        const self = this
        const svg = d3.select(`#${this.svgId}`)
        // svg.selectAll("g").remove()
        const leaves = svg.selectAll("g")
        .data(nodes.sort((a, b) => a.data.id - b.data.id), d => d.data.id)
            .join(
                enter => {
                    enter.append("g").attr("class", "node")
                    .attr("transform", d => `translate(${d.x0},${d.y0})`)
                    .each(function(d) {
                        const leaf = d3.select(this)
                        leaf.append("rect")
                            .attr("fill", d => color(d.data.id.split("/").at(1)))
                            .attr("fill-opacity", 0.4)
                            .attr("width", 0)
                            .attr("height", 0)
                            .transition().duration(500)
                            .attr("width", d => d.x1 - d.x0)
                            .attr("height", d => d.y1 - d.y0)
                            .attr("cursor", "pointer")
                            .selection()
                            .on("mouseover", function() {
                                d3.select(this)
                                    .attr("fill-opacity", 0.7)
                                    .attr("stroke", "black")
                                    .attr("stroke-width", 2)
                            })
                            .on("mouseout", function() {
                                d3.select(this).attr("fill-opacity", 0.6)
                                .attr("stroke", "none")
                            })
                            .on("click", function(e, d) {
                                if(!d.children) return
                                console.log(nodes, d)
                                const index = nodes.findIndex(item => item.data.id === d.data.id);

                                if (index === -1) {
                                    console.warn(`Object with id ${d.data.id} not found.`);
                                } else {
                                    // Extract the object and its children
                                    const [removedObject] = nodes.splice(index, 1);

                                    // Add the children of the removed object to the list, if any
                                    if (Array.isArray(removedObject.children)) {
                                        nodes.push(...removedObject.children);
                                    }
                                    self.render(nodes, color, format)
                                }

                            })
                        // const code_name = leaf.data()[0].data.data.code_name.split("\\").at(-1)
                        const code_name = d.data.id.split("/").at(-1)
                        const title = leaf.append("text") // title
                            .attr("x", 0)
                            .attr("y", 0)
                        title.selectAll("tspan")
                            .data(code_name.split(" ")) 
                            .join("tspan")
                                .attr("x", 5)
                                .attr("dy", 20)
                                .text(d => d)
                        title.append("tspan")
                            .attr("x", 5)
                            .attr("dy", 20)
                            .text(d => format(d.value));

                    })
                },
                update => update,
                exit => exit.remove()
            )

    }
}