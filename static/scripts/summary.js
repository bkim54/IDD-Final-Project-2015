var Summary = (function() {

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


	var start = function() {
		var onSuccess = function(data) {
			var summaries = document.getElementById('summaries');
			summaries.innerHTML = '';
			data['elems'].map(function(s) {
				var newElem = document.createElement('p');
				newElem.setAttribute('class', 'summary');
				newElem.innerHTML = s;
				summaries.appendChild(newElem)
			});
		}
		var onFailure = function() {
			console.error('error');
		};
		// onSuccess({'elems':['Your summary for today:','test test test 1', 'test test test 2', 'test test test 3', 'test test test 4']});
		makeGetRequest('/summary', onSuccess, onFailure);
        window.setInterval(function() {
			makeGetRequest('/summary', onSuccess, onFailure);
		}, 30);
	};


    // PUBLIC METHODS
    // any private methods returned in the hash are accessible via Mouse.key_name, e.g. Mous.start()
    return {
        start: start
    };
    
})();


