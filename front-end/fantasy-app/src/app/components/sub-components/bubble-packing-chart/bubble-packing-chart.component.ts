import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2 } from "@angular/core";
import * as d3 from 'd3';

@Component({
    selector: 'bubble-packing-chart',
    templateUrl: './bubble-packing-chart.component.html',
    styleUrls: ['./bubble-packing-chart.component.scss']
})
export class BubblePackingChartComponent implements AfterViewInit {

    @Input()
    data: any[] = []

    @Output()
    circleClicked = new EventEmitter<string>();

    constructor(private elementRef: ElementRef,
        private renderer: Renderer2
    ) { }

    ngAfterViewInit(): void {
        this.createVisualization();
    }

    createVisualization(): void {

        const width = parseInt(d3.select('#bubble_chart').style('width'), 10);
        const height = 460;

        // Using reduce to find min and max values
        const minMaxValues = this.data.reduce((acc, current) => {
            if (current.value < acc.min) {
                acc.min = current.value;
            }
            if (current.value > acc.max) {
                acc.max = current.value;
            }

            return acc;
        }, { min: Infinity, max: -Infinity });

        // Size scale for countries
        const size = d3.scaleLinear()
            .domain([minMaxValues.min, minMaxValues.max])
            .range([16, 57])

        // Functions to handle tooltip interactions
        const showBubbleTooltip = (event: any, d: any) => {
            bubbleTooltip.style('opacity', '1')
                .html(d.tooltip);
        };

        const updateBubbleTooltipContent = (event: any, d: any) => {
            const tooltip = bubbleTooltip.node();
            const target = event.target as SVGCircleElement;

            const left = target?.cx?.baseVal?.value + 50;
            const top = target?.cy?.baseVal?.value + 20;

            bubbleTooltip.style("opacity", "1")
                .html(d.tooltip)
                .style("left", left + "px")
                .style("top", top + "px");
        };

        const hideBubbleTooltip = (event: any, d: any) => {
            bubbleTooltip.html('')
                .style('opacity', '0')
        };

        // simulation code and dragging logic
        const simulation = d3.forceSimulation(this.data)
            .force('center', d3.forceCenter().x(width / 2).y(height / 2))
            .force('charge', d3.forceManyBody().strength(15))
            .force('collide', d3.forceCollide().strength(0.2).radius((d: any) => size(d.value) + 1).iterations(1))
            .on('tick', () => {
                circles.each((d: any, i: number, nodes: any) => {
                    this.renderer.setAttribute(nodes[i], 'cx', d.x.toString());
                    this.renderer.setAttribute(nodes[i], 'cy', d.y.toString());
                });
                labels.each((d: any, i: number, nodes: any) => {
                    this.renderer.setAttribute(nodes[i], 'dx', d.x.toString());
                    this.renderer.setAttribute(nodes[i], 'dy', d.y.toString());
                });
            });

        const dragstarted = (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(.03).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        const dragged = (event: any, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
        }
        const dragended = (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(.03);
            d.fx = null;
            d.fy = null;
        }

        // Append the SVG to the component's element
        const svg = d3.select(this.elementRef.nativeElement).append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create a tooltip
        const bubbleTooltip = d3.select(this.elementRef.nativeElement)
            .append('div')
            .style('opacity', '0')
            .style('position', 'absolute')
            .attr('class', 'tooltip')
            .style('background-color', '#e0e0e0')
            .style('border', 'solid')
            .style('border-width', '2px')
            .style('border-radius', '5px')
            .style('padding', '5px')
            .style('color', 'black');

        const circles = svg.selectAll('circle')
            .data(this.data)
            .enter()
            .append('circle')
            .attr("class", "node")
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', (d: any) => size(d.value))
            .style('fill', (d: any) => d.color)
            .style("fill-opacity", 0.8)
            .style('cursor', 'pointer')
            .attr("stroke", "black")
            .style("stroke-width", 1)
            .on("mouseover", showBubbleTooltip)
            .on("mousemove", updateBubbleTooltipContent)
            .on("mouseleave", hideBubbleTooltip)
            .on("click", (e: any, d: any) => this.circleClicked.emit(d.id))
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        const labels = svg.selectAll('text')
            .data(this.data)
            .enter()
            .append('text')
            .style("text-anchor", "middle")
            .style('cursor', 'pointer')
            .attr('fill', '#fff')
            .style("font-size", (d: any) => {
                const len = d.label.substring(0, size(d.value) / 3).length;
                let fontSize = size(d.value) / 3;
                fontSize *= 7 / len;
                fontSize += 1;
                return Math.round(fontSize) + 'px';
            })
            .text((d: any) => d.label)
            .on("mouseover", showBubbleTooltip)
            .on("mousemove", updateBubbleTooltipContent)
            .on("mouseleave", hideBubbleTooltip)
            .on("click", (e: any, d: any) => this.circleClicked.emit(d.id))
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));


        const infoText = svg
            .append("text")
            .attr("x", width - 10)
            .attr("y", height - 30)
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "ideographic")
            .attr("fill", "#484863")
            .attr("font-size", "12px");

        infoText
            .append("tspan")
            .attr("x", width - 10)
            .text("Player trade volume from the past week");

        infoText
            .append("tspan")
            .attr("x", width - 10)
            .attr("dy", "1.2em")
            .text("Hover, drag, & click for more");

    }
}
