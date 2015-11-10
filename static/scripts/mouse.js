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
		Chart.defaults.global.scaleFontSize = 20;
		var data = {
		    labels: ["8-9AM", "9-10AM", "10-11AM", "11-12PM", "12-1PM", "1-2PM", "2-3PM"],
		    datasets: [
		        {
		            label: "My First dataset",
		            fillColor: "rgba(220,220,220,0.5)",
		            strokeColor: "rgba(220,220,220,0.8)",
		            highlightFill: "rgba(220,220,220,0.75)",
		            highlightStroke: "rgba(220,220,220,1)",
		            data: [65, 59, 80, 81, 56, 55, 40]
		        },
		        {
		            label: "My Second dataset",
		            fillColor: "rgba(151,187,205,0.5)",
		            strokeColor: "rgba(151,187,205,0.8)",
		            highlightFill: "rgba(151,187,205,0.75)",
		            highlightStroke: "rgba(151,187,205,1)",
		            data: [28, 48, 40, 19, 86, 27, 90]
		        }
		    ]
		};
		var graph = new Chart(cxt).Bar(data, {});
	}

	var motionTrackerGraph= function() {
		var cxt = document.getElementById("motion-tracker-graph").getContext("2d");
		
		Chart.defaults.global.responsive = true;
		Chart.defaults.global.tooltipFontSize = 20;
		Chart.defaults.global.scaleFontSize = 20;
		var graphData = [
		    {
		        value: 5,
		        color:"#aaaaaa",
		        highlight: "#FF5A5E",
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
        	console.log(data);
        	console.log(graph);
        	graph.segments[0].value = data['wrist'];
        	graph.segments[1].value = data['elbow'];
        	graph.update();
        };
        var onFailure = function() { 
            console.error('error'); 
        };
        window.setInterval(function() {
			makeGetRequest('/motion_pie', onSuccess, onFailure);
		}, 3000);

	}

	var start = function() {
		motionBarGraph();
		motionTrackerGraph();
	};


    // PUBLIC METHODS
    // any private methods returned in the hash are accessible via Mouse.key_name, e.g. Mous.start()
    return {
        start: start
    };
    
})();