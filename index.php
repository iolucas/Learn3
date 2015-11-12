<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8"i/>
</head>


<body>
	<script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
	<script type="text/javascript" src="nodes.js"></script>
	<script>



/*

		var forceNodes,
			forceLinks;

		

		function updateNodes() {
			forceNodes = svg.selectAll("circle")
				.data(dataObj.nodes)
				.enter()
				.append("circle")
				.attr("r", 20);
	
		}







		force.on("tick", function() {

			
			node.attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
		});

		force.on("end", function(){
			node.attr("fixed", function(d) {
				console.log(d);
				//d.fixed = true;
			});

		});

		node.call(force.drag);*/



		/*var force = d3.layout.force()
			.linkDistance(30)	//distance between two nodes
			.linkStrength(1)	 //rigity of the link (how compressed or streched it will be once it is pulled/pushed)
			.size([width, height])	//size of the force field space 
			//(basically to calculate the gravity center and initial random pos for nodes which dont have coords)
			//.friction(0)	//friction factor of nodes(0 means full friction, 1 means frictionless)
			.charge(-1530)	//negative values means node repulsion, position means attraction
			//.chargeDistance(1)	//distance which change is applied
			//.theta(0.8)	//factor to improve computation of force calculations, not so important
			//.gravity(1)	//gravity force (spring force) to attract all nodes to the center
			.nodes(dataObj.nodes);	
			//.links(dataObj.links)
			//.start();

		//console.log(force.start());


		//Create and append svg container
		var svg = d3.select("body").append("svg")
			.attr("width", width)
			.attr("height", height)
			.style("border", "1px solid #000");

		//Append parent circle @ the center of the screen
		var centerNode = svg.append("circle")
			.attr("cx", width / 2)
			.attr("cy", height / 2)
			.attr("fill", "yellow")	
			.attr("stroke", "#000")	
			.attr("stroke-width", 3)	
			.attr("r", 50)
			.on("click", function() {
				//Add new node
				dataObj.nodes.push({});
				updateNodes();
			});

		updateNodes();




		function updateNodes() {

			var nodes = svg.selectAll("circle")
				.data(dataObj.nodes)
				.enter()
				.append("circle")
				//.attr("class", "node")
				.attr("fill", "blue")	
				.attr("stroke", "#000")	
				.attr("stroke-width", 1)	
				.attr("r", 20)
				.on("click", function() {
					dataObj.nodes.push({});
					updateNodes();
				});

			force.nodes(dataObj.nodes).start();

			nodes.call(force.drag);
		}*/


	</script>
</body>
</html>