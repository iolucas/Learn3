var svgContainer = d3.select("#svgContainer")
	.on("mousedown", function() {
		d3.select(this).style("cursor", "move");		
	})
	.on("mouseup", function() {
		d3.select(this).style("cursor", "");		
	});

var graphContainer = svgContainer.append("g");

//Must find way to fix bug of infinite drag positions
var zoomBehavior = d3.behavior.zoom()
	.scaleExtent([0.1, 1])
	.on("zoom", function(z) {
		graphContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	});

//Function to refresh the screen size
var refreshScreenSize = function() {
	svgContainer.attr("height", window.innerHeight)
		.attr("width", window.innerWidth);

	zoomBehavior.size([window.innerWidth, window.innerHeight]);
}

window.addEventListener("resize", refreshScreenSize);
window.addEventListener("load", refreshScreenSize);

svgContainer.call(zoomBehavior);



var width = window.innerWidth;
var height = window.innerHeight;




//Open file and execute main function
d3.csv("dataLinks.txt", dataOpened);


function dataOpened(dataLinks) {

	var dataNodes = {}

	//Populate nodes with links
	dataLinks.forEach(function(link) {

		//Generate objects for nodes that doesn't have, and return the object ref to the link source/target
		//link references are automatic done in case source/target are assigned with integers (index of the nodes)

		link.source = dataNodes[link.source] || (dataNodes[link.source] = {name: link.source});
  		link.target = dataNodes[link.target] || (dataNodes[link.target] = {name: link.target});
	});

	//Convert key value object to regular array
	dataNodes = d3.values(dataNodes);

	if(dataNodes.length > 0)
		dataNodes[0].fixed = true;	


	var links = graphContainer.selectAll("line").data(dataLinks).enter()
		.append("line")
  		.attr("stroke", "#222")
  		.attr("stroke-width", 2);




	var nodes = graphContainer.selectAll(".nodeCirc").data(dataNodes).enter()
		.append("circle")
		.style("cursor", "pointer")
		.attr("class", "nodeCirc")
		.attr("cx", function(d) {
			if(d.fixed)
				d.x = width / 2;
			else
				d.x = width / 2 + 10;

			return d.x;
		})
		.attr("cy", function(d) {
			if(d.fixed)
				d.y = height / 2;
			else
				d.y = height / 2 - 10;
			
			return d.y;
		})
		.attr("r", function(d) {
			if(d.fixed)
				d.nodeRadius = 50;
			else
				d.nodeRadius = 20;

			return d.nodeRadius;
		})
		.attr("fill", function(d){
			if(d.fixed)
				return "yellow";

			return "#222";
			return "rgb(202,149,255)";
		})	
		.attr("stroke", "#0A091A")
		.attr("stroke", "#fff")		
		.attr("stroke-width", 5)
		.attr("stroke-width", 3)
		.on("mouseover", function (d) {
			//d3.select(this).transition(100).attr("r", d.nodeRadius * 5);
			d3.select(this).transition(200).attr("stroke", "#00a")
				.attr("stroke-width", 5);
		})
		.on("mouseout", function (d) {
			//d3.select(this).transition(100).attr("r", d.nodeRadius);
			d3.select(this).transition(200).attr("stroke", "#fff")
				.attr("stroke-width", 3);
		})
		.on("click", betaDialog);

	var arrows = graphContainer.selectAll(".arrow").data(dataLinks).enter()
  		.append("path")
  		.attr("class", "arrow")
  		.attr("fill", "#222")
  		.attr("d", "M18,0 l20,5 v-10z");

	var labels = graphContainer.selectAll("text").data(dataNodes).enter()
		.append("text")
    	.attr("fill", function(d){
    		if(d.fixed)
    			return "#fff";

    		return "#fff";
    	})
    	.attr("font-size", 25)
    	.attr("font-family", "Segoe UI")
    	.style("text-shadow", "0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000")
    	.text(function(d) { 
    		if(d.name) 
    			return d.name; 
    		return "No Name";
    	});


	//Create force layout
	var force = d3.layout.force()
		.linkDistance(50)	//distance between two nodes
		.linkStrength(1)	 //rigity of the link (how compressed or streched it will be once it is pulled/pushed)
		.size([width, height])	//size of the force field space 
		.charge(function(oi) {
			if(oi.fixed)
				return -15000;

			return -2000;

			return -1000;
		})	//negative values means node repulsion, position means attraction
		//.chargeDistance(100000)
		.nodes(dataNodes)
		.links(dataLinks)
		.gravity(0.1)
		.on("tick", updatePositions)
		.on("end", updatePositions)
		.alpha(0)
		.start();

		//nodes.call(force.drag);

		function updatePositions(evt) {

			/*if(evt.type == "end") {
				nodes.attr("test", function(n){
					n.fixed = true;
				});

				//force.gravity(0);

				var containerBox = graphContainer[0][0].getBBox();

				var scaleHeight = containerBox.height / height;
				var scaleWidth = containerBox.width / width;

				var contScale;

				if(scaleHeight < scaleWidth) {
					graphContainer.attr("transform", "scale(" + 0.2 + ")");
				} else {
					graphContainer.attr("transform", "scale(" + 0.2 + ")");
				}


				//console.log(dHeight);
				//console.log(dWidth);
			}*/

			nodes.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });


			links.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });


			labels.attr("x", function(d) { 
				if(d.fixed)
					return d.x - 30; 

				return d.x + 12
			})
    		.attr("y", function(d) { return d.y + 8; });

    		arrows.attr("transform", function(d) {

    			var invertAngle = (d.target.x > d.source.x) ? 180 : 0;

    			var betaTan = (d.target.y - d.source.y) / (d.target.x - d.source.x);

    			d.linkAngle = (180 / Math.PI) * Math.atan(betaTan) + invertAngle;

    			var translateStr = "translate(" + d.target.x + " " + d.target.y + ")";
    			var rotateStr = "rotate(" + d.linkAngle + ")";

				return translateStr + " " + rotateStr;

			});
		}
}

function betaDialog() {
	vex.dialog.alert('Thanks for checking out Vex!');
	/*vex.dialog.confirm({
		message: 'Are you absolutely sure you want to destroy the alien planet?',
		callback: function(value) {
			return console.log(value ? 'Successfully destroyed the planet.' : 'Chicken.');
		}
	});*/
}
