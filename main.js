var svgContainer = d3.select("#svgContainer")
	.on("mousedown", function() {
		d3.select(this).style("cursor", "move");		
	})
	.on("mouseup", function() {
		d3.select(this).style("cursor", "");		
	});

var graphContainer = svgContainer.append("g");

var graphContPos = [0,0];

//Dialog Modal Size
var dialogSize = [1200,800];

var NODE_DRAG = false;

var SCREEN_DRAG = true;


//Must find way to fix bug of infinite drag positions
var zoomBehavior = d3.behavior.zoom()
	.scaleExtent([0.1, 1])
	.on("zoom", function(z) {
		graphContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		graphContPos = d3.event.translate;
	});

//Function to refresh the screen size
var refreshScreenSize = function() {
	svgContainer.attr("height", window.innerHeight)
		.attr("width", window.innerWidth);

	zoomBehavior.size([window.innerWidth, window.innerHeight]);

	d3.selectAll(".skill-dialog")
		.style("top", 50 + "px")
		.style("left", (window.innerWidth - dialogSize[0]) / 2  + "px")
}

window.addEventListener("resize", refreshScreenSize);
window.addEventListener("load", refreshScreenSize);

if(SCREEN_DRAG)
	svgContainer.call(zoomBehavior);


var drag = d3.behavior.drag()
	.origin(function(d) { return d; })
	.on("drag", function(d) {
		d.x = d3.event.x < 1 ? 1 : d3.event.x;
		d.y = d3.event.y < 1 ? 1 : d3.event.y;

		d3.select(this).attr("transform", "translate(" + d.x + " " + d.y + ")");	
	});

//Create csv parser to avoid some caracters crash


var csvParser = d3.dsv(",", "text/plain; charset=ISO-8859-1");

csvParser("userdata.csv", function(nodes) {

	//console.log(nodes);

	var nodeOffset = 0;

	//Populate nodes links with target references
	for(var i = 0; i < nodes.length; i++) {
		if(!nodes[i].connections)
			continue;

		//Create a links array on the node
		nodes[i].links = [];

		//Get the targets links
		var targets = nodes[i].connections.split(";");

		nodes[i].baseSkills = targets;
		
		//Iterate thru the links
		for(var j = 0; j < targets.length; j++) {
			var targetName = targets[j];

			//Iterate thru all the nodes to find the reference for the given link
			for(var k = 0; k < nodes.length; k++) {
				//If the name doesn't match, continue next iteration
				if(nodes[k].name != targetName)
					continue;

				//If the name matchs, push the current node reference to the links
				nodes[i].links.push({ targetNode: nodes[k] });
				break;//exit this iteration
			}
		}
	}


	//Function to open the skill dialog modal
	var openSkillModal = function(d) {
		//console.log(d);
		d3.select("body").style("position", "initial");

		var transitionDuration = 500;

		//Set Dark Screen
		var darkScreen = d3.select("body").append("div")
			.attr("class", "dark-screen");

		//Set Dialog Modal
		var skillDialog = d3.select("body").append("div")
			.attr("class", "skill-dialog")
			.style("width", d.containerWidth + "px")
			.style("height", d.containerHeight + "px")
			.style("top", d.y + graphContPos[1] + "px")
			.style("left", d.x + graphContPos[0] + "px");

		//Function to close the skill modal smoothly
		var closeSkillModal = function() {
			d3.select("body").style("position", "fixed");

			skillDialog.transition().duration(transitionDuration)
				.style("width", d.containerWidth + "px")
				.style("height", d.containerHeight + "px")
				.style("top", d.y + graphContPos[1] + "px")
				.style("left", d.x + graphContPos[0] + "px")
				.style("background-color", d.color)
				.style("opacity", 0)
				.remove();	//Remove the skill dialog


			darkScreen.transition().duration(transitionDuration)
				.style("opacity", 0)
				.remove();
			
			//Ensure all dark screen are removed
			//d3.selectAll(".dark-screen").remove();

			//Ensure all skill-dialog are removed
			//d3.selectAll(".skill-dialog").remove();
		}


		//Set Dialog Modal Upper Bar and Close Button
		skillDialog.append("div")
			.attr("class", "skill-dialog-top")
			.style("background-color", d.color)
			.append("span")
			.attr("class", "skill-dialog-close-button")
			.text("x")
			.on("click", closeSkillModal);

		//Set skill dialog data
		skillDialog.append("div")
			.attr("class", "skill-dialog-title")
			.text(d.name);


		var skillDialogDesc = skillDialog.append("div")
			.attr("class", "skill-dialog-content");

		//Function to set the skill modal description
		var setDescription = function() {
			skillDialogDesc.html(d.description);
		}


		//Check if the description exists
		if(d.description) {
			//If so, set it
			setDescription();	
		} else if(d.wikipediaTitle) {	
		//if not, check if we got one ref from wikipedia and attempt to get the desc from there
			var reqUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + d.wikipediaTitle;

			$.ajax({ 
				type: "GET",
				dataType: "jsonp",
				url: reqUrl,
				success: function(reqData){
					//If there data is not valid, return
					if(!reqData.query.pages)
						return;

					for(var prop in reqData.query.pages) {
						//If the extract data is valid, set it as the description
						var queryText = reqData.query.pages[prop].extract,
							queryMaxLength = 800;

						if(queryText) {
							//If the query text is too long, trunc it
							if(queryText.length > queryMaxLength)
								queryText = queryText.substr(0,queryMaxLength) + "...";

							//Add the wikipedia ref
							queryText += " <a target='_blank' href='https://en.wikipedia.org/wiki/" + d.wikipediaTitle + "'>Read More</a>";

							d.description = queryText;
							setDescription();
							break;
						}
					}

				}
			});
		}

		//If the node has books relation
		if(d.books) {

			var booksArray = d.books.split(";");
			//console.log(booksArray);

			skillDialog.append("div")
				.attr("class", "skill-dialog-subtitle")
				.text("Books");

			skillDialog.selectAll(".books").data(booksArray).enter()
				.append("div")
				.attr("class", "skill-dialog-content books")
				.text(function(bookName){ return bookName; });
		}

		//If the node has base skills
		if(d.baseSkills && d.baseSkills.length > 0) {

			skillDialog.append("div")
				.attr("class", "skill-dialog-subtitle")
				.text("Base Skills");

			skillDialog.selectAll(".base-skills").data(d.baseSkills).enter()
				.append("div")
				.attr("class", "skill-dialog-content base-skills")
				.text(function(baseSkillName){ return baseSkillName; });
		}

		//If the node has links
		if(d.internetRefs) {

			var linksArray = d.internetRefs.split(";");
			//console.log(linksArray);

			skillDialog.append("div")
				.attr("class", "skill-dialog-subtitle")
				.text("Links");

			skillDialog.selectAll(".internet-refs").data(linksArray).enter()
				.append("div")
				.attr("class", "skill-dialog-content internet-refs")
				.append("a")
				.attr("href", function(linkRef){ return linkRef; })
				.attr("target", "_blank")
				.text(function(linkRef){ return linkRef; });
		}




		//Show dark screen smoothly
		darkScreen.transition().duration(transitionDuration)
			.style("opacity", 1);

		//Show modal smoothly
		skillDialog.transition().duration(transitionDuration)
			.style("width", dialogSize[0] + "px")
			.style("height", dialogSize[1] + "px")
			.style("top", 50 + "px")
			.style("left", (window.innerWidth - dialogSize[0]) / 2  + "px")
			.style("opacity", 1);

	}



	var skillNode = graphContainer.selectAll(".skill-node").data(nodes).enter()
		.append("g")
		.attr("id", function(d) {
			return "skill-node-" + d.id;
		})
		.attr("class", "skill-node")
		.attr("transform", function(d) {
			if(d.x == undefined)
				d.x = "100";
			
			if(d.y == undefined)
				d.y = "100";

			d.x = parseInt(d.x) + nodeOffset;
			d.y = parseInt(d.y);

			return "translate(" + d.x + " " + d.y +")";

		})
		.on("click", openSkillModal);

	//DEBUG PURPOSES
	if(NODE_DRAG)
		skillNode.call(drag);	
		
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
		console.log("CHANGE INPUT RECTANGLE TO A INPUT ARROW");

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

		var linkSource = { x: d.x, y: d.y + 20 }

		//Iterate thru the output links of the node
		d.links.forEach(function(link) {

			var linkTarget = { x: link.targetNode.x + link.targetNode.containerWidth, y: link.targetNode.y + 20 }


			var linkPath = createLink({ source: linkSource, target: linkTarget });


			var nodeLink = graphContainer.insert("path", ":first-child")
				.attr("class", "skill-link")
				.attr("d", linkPath)
				.attr("fill", "none")
				.attr("stroke", "#000")
				.attr("stroke-width", 2);

		});

	});



});




