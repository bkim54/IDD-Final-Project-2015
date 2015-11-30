var Mouse = (function() {

	var apiUrl = 'http://localhost:8080'
 	/**
    * HTTP GET request 
    * @param  {string}   url       URL path, e.g. "/api/smiles"
    * @param  {function} onSuccess   callback method to execute upon request success (200 status)
    * @param  {function} onFailure   callback method to execute upon request failure (non-200 status)
    * @return {None}
    */
	var makeGetRequest = function(url, onSuccess, onFailure) {
		$.ajax({
		   type: 'GET',
		   url: apiUrl + url,
		   dataType: "json",
		   success: onSuccess,
		   error: onFailure
		});
	};

    /**
     * HTTP POST request
     * @param  {string}   url       URL path, e.g. "/api/smiles"
     * @param  {Object}   data      JSON data to send in request body
     * @param  {function} onSuccess   callback method to execute upon request success (200 status)
     * @param  {function} onFailure   callback method to execute upon request failure (non-200 status)
     * @return {None}
     */
    var makePostRequest = function(url, data, onSuccess, onFailure) {
        $.ajax({
            type: 'POST',
            url: apiUrl + url,
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: onSuccess,
            error: onFailure
        });
    };

	var motionBarGraph = function() {
		var cxt = document.getElementById("motion-bar-graph").getContext("2d");
		
		Chart.defaults.global.responsive = true;
		Chart.defaults.global.tooltipFontSize = 20;
		Chart.defaults.global.scaleFontSize = 14;
		Chart.defaults.global.animation = false;
		var data = {
		    labels: ["8-9AM", "9-10AM", "10-11AM", "11-12PM", "12-1PM", "1-2PM", "2-3PM"],
		    datasets: [
		        {
		            label: "Elbow",
		            fillColor: "rgba(220,220,220,0.5)",
		            strokeColor: "rgba(220,220,220,0.8)",
		            highlightFill: "rgba(220,220,220,0.75)",
		            highlightStroke: "rgba(220,220,220,1)",
		            data: [65, 59, 80, 81, 56, 55, 40]
		        },
		        {
		            label: "Wrist",
		            fillColor: "rgba(151,187,205,0.5)",
		            strokeColor: "rgba(151,187,205,0.8)",
		            highlightFill: "rgba(151,187,205,0.75)",
		            highlightStroke: "rgba(151,187,205,1)",
		            data: [28, 48, 40, 19, 86, 27, 90]
		        }
		    ]
		};
		var graph = new Chart(cxt).Bar(data, {});
		var onSuccess = function(data) {
        	// console.log(data);
        	// console.log(graph);
        	while (graph.datasets[0].bars.length) {
        		graph.removeData();
    		};
        	for (key in data) {
        		// graph.scale.xLabel[key] = (key == 0 || key == 12 ? 12 : key%12).toString() + (key >= 12 ? "PM":"AM");
        		// graph.datasets[0].data[key] = data[key]['elbow'];
        		// graph.datasets[1].data[key] = data[key]['wrist'];
        		graph.addData([data[key]['elbow'], data[key]['wrist']], (key == 0 || key == 12 ? 12 : key%12).toString() + (key >= 12 ? " PM":" AM"));

        	};
        	graph.update();
        	// console.log(graph);
        };
        var onFailure = function() { 
            console.error('error'); 
        };
		makeGetRequest('/motion_bar', onSuccess, onFailure);
  //       window.setInterval(function() {
		// 	makeGetRequest('/motion_bar', onSuccess, onFailure);
		// }, 5000);
	}

	var motionPieGraph= function() {
		var cxt = document.getElementById("motion-tracker-graph").getContext("2d");
		
		Chart.defaults.global.responsive = true;
		Chart.defaults.global.tooltipFontSize = 20;
		Chart.defaults.global.scaleFontSize = 20;
		var graphData = [
		    {
		        value: 5,
		        color:"#aaaaaa",
		        highlight: "#5F5A5E",
		        label: "Wrist"
		    },
		    {
		        value: 5,
		        color: "#76BFFD",
		        highlight: "#5AD3D1",
		        label: "Elbow"
		    }
		]
		var graph = new Chart(cxt).Pie(graphData, {});
        var onSuccess = function(data) {
        	graph.segments[0].value = data['wrist'];
        	graph.segments[1].value = data['elbow'];
        	graph.update();
        };
        var onFailure = function() { 
            console.error('error'); 
        };
		makeGetRequest('/motion_pie', onSuccess, onFailure);
        window.setInterval(function() {
			makeGetRequest('/motion_pie', onSuccess, onFailure);
		}, 5000);

	}

	var pressureTracker= function() {
        var onSuccess = function(data) {
        	var upperCenter = Math.floor(data['FSR0']*5);
			var lowerCenter = upperCenter-1;
			var amount = (data['FSR0']*5)%1;
			document.getElementById("mouse-wrist-" + upperCenter).style.opacity=amount;
			if (upperCenter > 0) {
				document.getElementById("mouse-wrist-" + lowerCenter).style.opacity=1;
			}
			upperCenter = Math.floor(data['FSR1']*5);
			lowerCenter = upperCenter-1;
			amount = (data['FSR1']*5)%1;
			document.getElementById("mouse-left-" + upperCenter).style.opacity=amount;
			if (upperCenter > 0) {
				document.getElementById("mouse-left-" + lowerCenter).style.opacity=1;
			}
			upperCenter = Math.floor(data['FSR2']*5);
			lowerCenter = upperCenter-1;
			amount = (data['FSR2']*5)%1;
			document.getElementById("mouse-right-" + upperCenter).style.opacity=amount;
			if (upperCenter > 0) {
				document.getElementById("mouse-right-" + lowerCenter).style.opacity=1;
			}
        };
        var onFailure = function() { 
            console.error('error'); 
        };
		makeGetRequest('/pressure_map', onSuccess, onFailure);
        window.setInterval(function() {
			makeGetRequest('/pressure_map', onSuccess, onFailure);
		}, 50, that);

	}

	var start = function() {
		// motionBarGraph();
		// motionPieGraph();
		pressureTracker();
	};


    // PUBLIC METHODS
    // any private methods returned in the hash are accessible via Mouse.key_name, e.g. Mous.start()
    return {
        start: start
    };
    
})();