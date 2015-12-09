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
		            label: "Wrist",
		            fillColor: "#aaaaaa",
		            strokeColor: "#888888",
		            highlightFill: "rgba(151,187,205,0.75)",
		            highlightStroke: "rgba(151,187,205,1)",
		            data: [28, 48, 40, 19, 86, 27, 90]
		        },
		        {
		            label: "Elbow",
		            fillColor: "#86AFFD",
		            strokeColor: "#668FDD",
		            highlightFill: "rgba(220,220,220,0.75)",
		            highlightStroke: "rgba(220,220,220,1)",
		            data: [65, 59, 80, 81, 56, 55, 40]
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
        window.setInterval(function() {
			makeGetRequest('/motion_bar', onSuccess, onFailure);
		}, 1000);
	}

	var motionPieGraph= function() {
		var cxt = document.getElementById("motion-tracker-graph").getContext("2d");
		
		Chart.defaults.global.responsive = true;
		Chart.defaults.global.tooltipFontSize = 20;
		Chart.defaults.global.scaleFontSize = 20;
		var graphData = [
		    {
		        value: 17,
		        color:"#aaaaaa",
		        highlight: "#5F5A5E",
		        label: "Wrist"
		    },
		    {
		        value: 5,
		        color: "#86AFFD",
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
		}, 1000);

	}

	var pressureTracker= function() {
        var onSuccess = function(data) {
        	if (data['FSR0'] < 1) data['FSR0'] = 1;
        	if (data['FSR1'] < 1) data['FSR1'] = 1;
        	if (data['FSR2'] < 1) data['FSR2'] = 1;
        	data['FSR0'] = (1024 - data['FSR0'] - 20)/(1024-20);
        	data['FSR1'] = (1024 - data['FSR1'] - 30)/(1024-30);
        	data['FSR2'] = (1024 - data['FSR2'] - 30)/(1024-30) + Math.random()*.05 - .025;
        	if (data['FSR0'] > .999) data['FSR0'] = .999; // wrist - 20
        	if (data['FSR1'] > .999) data['FSR1'] = .999; // left - 30
        	if (data['FSR2'] > .999) data['FSR2'] = .999; // right
        	console.log(data);
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
            // onSuccess({'FSR0':80, 'FSR1':40, 'FSR2':60});
        };

        // onSuccess({'FSR0':20, 'FSR1':9, 'FSR2':75});
        checkMouseSize();
		makeGetRequest('/pressure_map', onSuccess, onFailure);
        window.setInterval(function() {
			makeGetRequest('/pressure_map', onSuccess, onFailure);
		}, 30);

	};

	var checkMouseSize = function() {
		console.log($(".mouse").height());
		$(".mouse-images").height($(".mouse").height()*1.2);
	};

	var start = function() {
		checkMouseSize();
		motionBarGraph();
		motionPieGraph();
		pressureTracker();
		window.addEventListener("resize", checkMouseSize);
	};


    // PUBLIC METHODS
    // any private methods returned in the hash are accessible via Mouse.key_name, e.g. Mous.start()
    return {
        start: start
    };
    
})();