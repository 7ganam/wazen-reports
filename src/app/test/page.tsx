"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReactDOM from "react-dom";

interface DataItem {
  id: number;
  name: string;
  rangeStart: number;
  rangeEnd: number;
  value: number;
}

const HorizontalBarChart = () => {
  const data: DataItem[] = Array.from(Array(2000).keys()).map((i) => {
    return {
      id: i,
      name: `name ${i}`,
      rangeStart: Math.floor(Math.random() * 1000) + 1000,
      rangeEnd: Math.floor(Math.random() * 2000) + 2000,
      value: Math.floor(Math.random() * 6000),
    };
  });

  //order data by rangeStart
  const sortedData = [...data].sort((a, b) => a.rangeStart - b.rangeStart);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 20, left: 50 };
    const width = 1500 - margin.left - margin.right;
    const height = 50000 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 6000]).range([0, width]);
    const yScale = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.id.toString()))
      .range([0, height])
      .padding(0.1);

    svg
      .selectAll(".baseRects")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("x", (d) => 0)
      .attr("y", (d) => (yScale(d.id.toString()) || 0) + yScale.bandwidth() / 2)
      .attr("width", (d) => xScale(6000))
      .attr("height", 1)
      .attr("fill", "grey");

    svg
      .selectAll(".rangeRects")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.rangeStart) || 0)
      .attr("y", (d) => (yScale(d.id.toString()) || 0) + yScale.bandwidth() / 2)
      .attr("width", (d) => xScale(d.rangeEnd - d.rangeStart))
      .attr("height", 3)
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "yellow");
        d3.select(tooltipRef.current)
          .style("display", "block")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px")
          .html(`Product: ${d.name}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue");
        d3.select(tooltipRef.current).style("display", "none");
      });

    svg
      .selectAll("circle.start")
      .data(sortedData)
      .enter()
      .append("circle")
      .attr("class", "start")
      .attr("cx", (d) => xScale(d.rangeStart))
      .attr(
        "cy",
        (d) => (yScale(d.id.toString()) || 0) + yScale.bandwidth() / 2
      )
      .attr("r", 5)
      .attr("fill", "steelblue") // Initial color
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "yellow");

        // Show the tooltip on hover
        d3.select(tooltipRef.current)
          .style("display", "block")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px")
          .html(`Start Value: ${d.rangeStart}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue");

        // Hide the tooltip on mouseout
        d3.select(tooltipRef.current).style("display", "none");
      });

    svg
      .selectAll("circle.end")
      .data(sortedData)
      .enter()
      .append("circle")
      .attr("class", "end")
      .attr("cx", (d) => xScale(d.rangeEnd))
      .attr(
        "cy",
        (d) => (yScale(d.id.toString()) || 0) + yScale.bandwidth() / 2
      )
      .attr("r", 5)
      .attr("fill", "steelblue") // Initial color
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "yellow");
        console.log(`End Value: ${d.rangeEnd}`);
        // Show the tooltip on hover
        d3.select(tooltipRef.current)
          .style("display", "block")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px")
          .html(`End Value: ${d.rangeEnd}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue");
        d3.select(tooltipRef.current).style("display", "none");
      });

    svg
      .selectAll("circle.value")
      .data(sortedData)
      .enter()
      .append("circle")
      .attr("class", "value")
      .attr("cx", (d) => xScale(d.value))
      .attr(
        "cy",
        (d) => (yScale(d.id.toString()) || 0) + yScale.bandwidth() / 2
      )
      .attr("r", 5)
      .attr("fill", "red") // Initial color
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "yellow");
        console.log(`End Value: ${d.value}`);
        d3.select(tooltipRef.current)
          .style("display", "block")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px")
          .html(`Value: ${d.value}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "red");
        d3.select(tooltipRef.current).style("display", "none");
      });
  }, [sortedData]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      {/* Tooltip container */}
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          display: "none",
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "10px",
          zIndex: 1,
        }}
      ></div>
    </div>
  );
};

export default HorizontalBarChart;
