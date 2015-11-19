var width = 900;
var height = 1800;


var svgContainer = d3.select("#svgContainer")
	.attr("height", width)
	.attr("width", height)
	.style("background-color", "#ddd");

//var graphContainer = svgContainer.append("g");


var drag = d3.behavior.drag()
	.origin(function(d) { return d; })
	.on("drag", function(d) {
		d.x = d3.event.x < 1 ? 1 : d3.event.x;
		d.y = d3.event.y < 1 ? 1 : d3.event.y;

		d3.select(this).attr("transform", "translate(" + d.x + " " + d.y + ")");	
	});


var dataCollection = [
	{
		id: 0,
		name: "Math",
		color: "#55f",
		x: 100,
		y: 20,
		links: [
			{ targetId: 1 },
			{ targetId: 2 }
		]
	},
	{
		id: 1,
		name: "Portuguese",
		color: "#5f5",
		x: 300,
		y: 120,
		links: [
			{ targetId: 2 }
		]
	},
	{
		id: 2,
		name: "Science",
		color: "#f55",
		inputs: 1,
		outputs: 1,
		x: 500,
		y: 220,
		links: []
	}
];


//Set outputs references
dataCollection.forEach(function(node, index) {

	node.links.forEach(function(link) {
		link.targetNode = dataCollection[link.targetId];
	});

});




var skillNode = svgContainer.selectAll(".skill-node").data(dataCollection).enter()
	.append("g")
	.attr("id", function(d) {
		return "skill-node-" + d.id;
	})
	.attr("class", "skill-node")
	.attr("transform", function(d) {
		if(d.x == undefined)
			d.x = 100;
		
		if(d.y == undefined)
			d.y = 100;

		return "translate(" + d.x + " " + d.y +")";

	}).call(drag);
	
var skillNodeContainer = skillNode.append("rect")
	.attr("class", "skill-node-container")
	.attr("height", function(d) {
		//d.containerHeight = 12 * d.outputs.length + 28;
	
		d.containerHeight = 40;	//DEBUG

		return d.containerHeight;
	})
	//.attr("rx", 0)
	//.attr("ry", 0)
	.attr("stroke-width", 2)
	.attr("stroke", "#fff")
	.attr("fill", function(d) {
		return d.color;
	});


skillNode.append("rect")
	.attr("x", 1)
	.attr("y", 1)
	.attr("width", 28)
	.attr("height", function(d) {
		return d.containerHeight - 2;	
	})
	.attr("stroke", "none")
	.attr("fill-opacity", 0.2)
	.attr("fill", "#000");



skillNode.append("text")
	.attr("class", "skill-node-label")
	.text(function(d) { return d.name; })
	.attr("x", 38)
	.attr("y", function(d) {
		//Set y position in function of container height
		
		var textBox = this.getBBox();
		
		d.containerWidth = textBox.width < 40 ? 100 : textBox.width + 60;

		return (d.containerHeight - textBox.height) / 2 - textBox.y;
	});

//input symbol
skillNode.append("rect")
	.attr("width", 10)
	.attr("height", 10)
	.attr("fill", "#aaa")
	.attr("rx", 2)
	.attr("ry", 2)
	.attr("stroke", "#fff")
	.attr("stroke-width", 2)
	.attr("x", -5)
	.attr("y", function(d) {
		return (d.containerHeight - 10) / 2;
	});

//output symbol
skillNode.append("rect")
	.attr("width", 10)
	.attr("height", 10)
	.attr("fill", "#aaa")
	.attr("rx", 2)
	.attr("ry", 2)
	.attr("stroke", "#fff")
	.attr("stroke-width", 2)
	.attr("x", function(d) {
		return d.containerWidth - 5;
	})
	.attr("y", function(d) {
		return (d.containerHeight - 10) / 2;
	});

skillNodeContainer.attr("width", function(d) { return d.containerWidth; });


//Create the links

var createLink = d3.svg.diagonal()
	.source(function(d) { return {"x":d.source.y, "y":d.source.x}; })            
    .target(function(d) { return {"x":d.target.y, "y":d.target.x}; })
    .projection(function(d) { return [d.y, d.x]; });



//Iterate thru all the skill nodes
skillNode.each(function(d) {
	
	if(d.links == undefined || d.links.length < 1)
		return;

	var linkSource = { x: d.x + d.containerWidth, y: d.y + 20 }

	//Iterate thru the output links of the node
	d.links.forEach(function(link) {

		var linkTarget = { x: link.targetNode.x, y: link.targetNode.y + 20 }


		var linkPath = createLink({ source: linkSource, target: linkTarget });


		svgContainer.insert("path", ":first-child")
			.attr("class", "skill-link")
			.attr("d", linkPath)
			.attr("fill", "none")
			.attr("stroke", "#000")
			.attr("stroke-width", 2);
	});

});






//Open file and execute main function
//d3.csv("dataNodes.txt", dataOpened);


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


