//-----------------------------------------------------------------------
//					Begin Global Variables Definition
//-----------------------------------------------------------------------

	//Store the current position of the nodes main container
	var graphContPos = [0,0];	

	//Store the size of the node modal dialog box
	var dialogSize = [1200,800];

	//Flag signalizing whether node drag is allowed
	var NODE_DRAG = true;

	//Flag signalizing whether screen drag/zoom is allowed
	var SCREEN_DRAG = true;

	//Flag to signalize if the we should prevent the selection clear due to some event
	var preventMouseClick = false;

	//Value in milliseconds for the transitions to occurr
	var transitionDuration = 500;

	//Flag showing whether a node is selected
	var nodeSelected = false;

//-----------------------------------------------------------------------
//					End Global Variables Definition
//-----------------------------------------------------------------------




//KEEP ORGANIZING THIS MAIN FILE, AND CREATE WAY FOR PROJECT NODES




//-----------------------------------------------------------------------
//					Begin Main SVG Objects Definition
//-----------------------------------------------------------------------

	//Append svg container
	var svgContainer = d3.select("#general-content").append("svg");	

	//Append rectangle to receive mouse events such void click or screen zooming/moving
	var svgMouseArea = svgContainer.append("rect")
		.attr("fill", "#ddd")
		.on("mousedown", function() {
			d3.select(this).style("cursor", "move");		
		})
		.on("mouseup", function() {
			d3.select(this).style("cursor", "");		
		});

	//Append nodes main container
	var graphContainer = svgContainer.append("g");

//-----------------------------------------------------------------------
//					End Main SVG Objects Definition
//-----------------------------------------------------------------------




//-----------------------------------------------------------------------
//					Begin Functions Definition
//-----------------------------------------------------------------------

	//Function to handle screen zooming/draging
	var zoomBehavior = d3.behavior.zoom()
		.scaleExtent([0.1, 1])
		.on("zoom", function(z) {

			graphContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
			graphContPos = d3.event.translate;

			//Prevent clear selection due to sequential mouse click event on mouse move event
			if(d3.event.sourceEvent && d3.event.sourceEvent.type == "mousemove" && false)
				preventMouseClick = true;
		});

	//Function to handle nodes drag
	var drag = d3.behavior.drag()
		.origin(function(d) { return d; })
		.on("drag", function(d) {
			d.x = d3.event.x < 1 ? 1 : d3.event.x;
			d.y = d3.event.y < 1 ? 1 : d3.event.y;

			d.x = d3.event.x;
			d.y = d3.event.y;

			//Update dragged node parent and child links paths
			for(var i = 0; i < d.parentLinks.length; i++) {
				var currLink = d.parentLinks[i];
				currLink.linkObj.attr("d", createLinkPath(currLink));
			}

			for(var i = 0; i < d.childLinks.length; i++) {
				var currLink = d.childLinks[i];
				currLink.linkObj.attr("d", createLinkPath(currLink));
			}

			d.nodeObj.attr("transform", "translate(" + d.x + " " + d.y + ")");	
		});

	//Function to handle screen size change
	var onScreenSizeChange = function() {

		//Update svg view window size
		svgContainer.attr("height", window.innerHeight)
			.attr("width", window.innerWidth);

		//Update svg mouse area size
		svgMouseArea.attr("height", window.innerHeight)
			.attr("width", window.innerWidth);

		//Update the zoom behavior size for smooth transitions
		zoomBehavior.size([window.innerWidth, window.innerHeight]);

		//Get the skill modal window left value
		var newLeftValue = window.innerWidth - dialogSize[0];
		newLeftValue = newLeftValue < 0 ? 0 : newLeftValue / 2;

		//Set the new positions for the skill modal dialog
		d3.selectAll(".skill-dialog")
			.style("top", 50 + "px")
			.style("left", newLeftValue + "px")
	}

	//Function to create the path of a diagonal line (x and y are inverted for right line projection)
	var createLinkPath = d3.svg.diagonal()
		.source(function(link) { 
			return { x: link.source.y + 20, y: link.source.x + link.source.containerWidth }; 
		})            
    	.target(function(link) { 
    		return { x: link.target.y + 20, y: link.target.x }; 
    	})
    	.projection(function(d) { 
    		return [d.y, d.x]; 
    	});

	//Function to open a csv format file and convert it to JSON object
	//(Must create a new csv parser to avoid some caracters crash that happens when using the standard parser)
	var csvParser = d3.dsv(",", "text/plain; charset=ISO-8859-1");

	//Function to open the skill dialog modal
	var openSkillModal = function(d) {

		//Cancel event bubble to avoid another actions to occurr on double click 
		d3.event.cancelBubble = true;

		//Set the body position to initial to show the y scroll 
		d3.select("body").style("position", "initial");



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


		//Set Dialog Modal Upper Bar and Close Button
		skillDialog.append("div")
			.attr("class", "skill-dialog-top")
			.style("background-color", d.color)
			.append("span")
			.attr("class", "skill-dialog-close-button")
			.text("x")
			.on("click", function() { return closeSkillModal(d); });

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

			//Send REST request for wikipedia data
			ajaxGetRequest(reqUrl, function(reqData) {
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
			});
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

	//Function to close the skill modal smoothly
	var closeSkillModal = function(d) {
		d3.select("body").style("position", "fixed");

		d3.selectAll(".skill-dialog").transition().duration(transitionDuration)
			.style("width", d.containerWidth + "px")
			.style("height", d.containerHeight + "px")
			.style("top", d.y + graphContPos[1] + "px")
			.style("left", d.x + graphContPos[0] + "px")
			.style("background-color", d.color)
			.style("opacity", 0)
			.remove();	//Remove the skill dialog


		d3.selectAll(".dark-screen").transition().duration(transitionDuration)
			.style("opacity", 0)
			.remove();
		
		//Ensure all dark screen are removed
		//d3.selectAll(".dark-screen").remove();

		//Ensure all skill-dialog are removed
		//d3.selectAll(".skill-dialog").remove();
	}

	//Function to clear all selections
	var clearAllSelections = function() {

		if(!nodeSelected)
			return;

		if(preventMouseClick) {
			preventMouseClick = false;
			return;
		}

		//Focus all nodes
		graphContainer.selectAll(".skill-node")
			.style("opacity", 1);

		//Focus all links
		graphContainer.selectAll(".skill-link")
			.style("opacity", 1);

		//Clear any selected class
		d3.selectAll(".skill-node-container-selected")
			.classed("skill-node-container-selected", false);

		nodeSelected = false;
	}

	//Function to wrap http get data via jquery ajax
	var ajaxGetRequest = function(requestUrl, callback) {
		return $.ajax({ 
			type: "GET",
			dataType: "jsonp",
			url: requestUrl,
			success: callback
		});
	}

	//Function to highlight all the path towards a specified node
	var selectNodePath = function(d) {

		//Avoid click event on svgContainer
		d3.event.cancelBubble = true;

		if(preventMouseClick) {
			preventMouseClick = false;
			return;
		}

		nodeSelected = true;

		//Unfocus all nodes
		graphContainer.selectAll(".skill-node")
			.style("opacity", .1);

		//Unfocus all links
		graphContainer.selectAll(".skill-link")
			.style("opacity", .1);

		//Clear any selected class
		d3.selectAll(".skill-node-container-selected")
			.classed("skill-node-container-selected", false);

		//Highlight target node selected class
		d.nodeObj.select(".skill-node-container")
			.classed("skill-node-container-selected", true);


		//Function to recursively highlight nodes chain
		var highlightNodes = function(tNode) {
			tNode.nodeObj.style("opacity", 1);	

			//iterate thru all parent links
			for(var i = 0; i < tNode.parentLinks.length; i++) {
				var currLink = tNode.parentLinks[i];

				currLink.linkObj.style("opacity", 1);	

				highlightNodes(currLink.source);//recurse this function on the node
			}

		}

		//Recursivelly highlight clicked node and its parents
		highlightNodes(d);
	}

//-----------------------------------------------------------------------
//						End Functions Definition
//-----------------------------------------------------------------------



//-----------------------------------------------------------------------
//						Begin App Execution
//-----------------------------------------------------------------------


window.addEventListener("resize", onScreenSizeChange);
window.addEventListener("load", onScreenSizeChange);

if(SCREEN_DRAG)
	svgMouseArea.call(zoomBehavior);

svgMouseArea.on("click", clearAllSelections);


csvParser(USER_PATH + "user-data.csv", function (nodes) {

	//Nodes map to get nodes reference thru their names
	var nodesMap = {}

	//Links array to store all the links references
	var linksArray = [];

	//Populate nodes map and define necessary objects and arrays for all the nodes
	for(var i = 0; i < nodes.length; i++) {
		var currNode = nodes[i];

		//Set node reference to the nodesMap
		nodesMap[currNode.name] = currNode;
		
		currNode.parentLinks = [];	//Define parent links array
		currNode.childLinks = [];	//Define child links array

		currNode.baseSkills = currNode.connections ? currNode.connections.split(";") : [];
	}

	//Populate nodes links with target references
	for(var i = 0; i < nodes.length; i++) {
		var currNode = nodes[i];

		//Iterate thru the baseSkillsNames
		for(var j = 0; j < currNode.baseSkills.length; j++) {
			var baseSkill = currNode.baseSkills[j],
				baseSkillNode = nodesMap[baseSkill];

			//Create new link object
			var newLink = { source: baseSkillNode, target: currNode }
			linksArray.push(newLink);

			//push the line reference
			currNode.parentLinks.push(newLink);

			//push the line reference
			baseSkillNode.childLinks.push(newLink);
		}
	}


	//Create nodes
	var skillNode = graphContainer.selectAll(".skill-node").data(nodes).enter()
		.append("g")
		.attr("class", "skill-node")
		.attr("transform", function(d) {
			//Set node ref to the node data obj
			d.nodeObj = d3.select(this);

			if(d.x == undefined)
				d.x = "100";
			
			if(d.y == undefined)
				d.y = "100";

			d.x = parseInt(d.x);
			d.y = parseInt(d.y);

			return "translate(" + d.x + " " + d.y +")";

		})
		.on("click", selectNodePath)
		.on("dblclick", openSkillModal);

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

	//Set skill container width now the text has been placed
	skillNodeContainer.attr("width", function(d) { return d.containerWidth; });

	//Draw input symbol
	skillNode.append("path")
		.attr("d", "M0,0 14,7 L0,14z")
		.attr("fill", "#aaa")
		.attr("stroke", "#fff")
		.attr("stroke-width", 2)
		.attr("transform", function(d) {
			return "translate(-5 " + (d.containerHeight - 14) / 2 + ")";
		});

	//Draw output symbol
	skillNode.append("path")
		.attr("d", "M0,0 14,7 L0,14z")
		.attr("fill", "#aaa")
		.attr("stroke", "#fff")
		.attr("stroke-width", 2)
		.attr("transform", function(d) {
			return "translate(" + (d.containerWidth - 5) + " " + (d.containerHeight - 14) / 2 + ")";
		});




	//Create the links
	var skillLink = graphContainer.selectAll(".skill-link").data(linksArray).enter()
		.insert("path", ":first-child")
		.attr("class", "skill-link")
		.attr("d", function(link) {
			link.linkObj = d3.select(this);	//get the link obj reference

			//Return the path created by the source and target nodes
			return createLinkPath(link);
		})
		.attr("fill", "none")
		.attr("stroke", "#000")
		.attr("stroke-width", 2);

});




