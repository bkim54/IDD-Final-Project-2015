var Mouse = (function() {

	var start = function() {
		var cxt = document.getElementById("motion-tracker-graph").getContext("2d");
		                        
		var graph = new BarGraph(cxt);
		graph.margin = 2;
		graph.width = 570;
		graph.height = 500;
		graph.xAxisLabelArr = ["8-9","AM", "9-10","AM", "10-11","AM", "11-12","PM", "12-1","PM", "1-2","PM", "2-3","PM", "3-4","PM", "4-5","PM"];
		graph.colors = ["blue", "black"]
		graph.update([3, 5, 3, 4, 4, 13, 2, 4, 7, 3, 5, 3, 4, 4, 10, 2, 4, 7]);
	};


    // PUBLIC METHODS
    // any private methods returned in the hash are accessible via Mouse.key_name, e.g. Mous.start()
    return {
        start: start
    };
    
})();