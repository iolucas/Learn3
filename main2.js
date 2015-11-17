var width = 900;
var height = 1800;


var svgContainer = d3.select("#svgContainer")
	.attr("height", width)
	.attr("width", height)
	.style("background-color", "#ddd");

var graphContainer = svgContainer.append("g");


var drag = d3.behavior.drag()
	.origin(function(d) { return d; })
	.on("drag", function(d) {
		d.x = d3.event.x;
		d.y = d3.event.y;

		d3.select(this).attr("transform", "translate(" + d.x + " " + d.y + ")");	
	});



//Open file and execute main function
d3.csv("dataNodes.txt", dataOpened);


function dataOpened(dataNodes) {

	var nodes = graphContainer.selectAll(".node-rect").data(dataNodes).enter()
		.append("g")
		.attr("class", "node-rect")
		.attr("transform", function(d) {
			d.x = 0;
			d.y = 0;
			return "translate(0 0)";
		})
		.call(drag);

	nodes.append("rect")
		.attr("class", "node-rect")
		.attr("fill", "#eee")
		.attr("rx", "5")
		.attr("stroke", "#222")
		.attr("stroke-width", 2)
		.attr("width", 120)
		.attr("height", 40);

	nodes.append("text")
		.attr("fill", "#222")
		.attr("font-size", 25)
		.text(function(d) { return d.name; })
		.attr("x", function(d) {
			return (120 - this.getBBox().width) / 2;
		})
		.attr("y", function(d) {
			var thisBox = this.getBBox(); 
			return thisBox.height;
		});
			
	

}



function createNode(name) {

	var nodeGroup = svgContainer.append("g")
		.attr("class", "betaNode")
		.attr("transform", "translate(30 30)");




	nodeGroup.append("text")
		.attr("fill", "#222")
		.style("font-size", "20px")
		.text("test");	
	var textNode = graphContainer.selectAll(".node-text").data(dataNodes).enter()


}
