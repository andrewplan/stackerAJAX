// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);
	return result;
};


// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
        sort: 'creation'
	};
	
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET",
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

//takes object of top answerers pulled from StackOverflow and returns new result to append to DOM.  
var showAnswerer = function(theAnswerer) {
	
	//clones template display code for top answerers results
	var result = $('.templates .answerer').clone();
    
    //set display name and user ID of answerer
    var answererIds = result.find('.answerer-ids');
	answererIds.html('<a target="_blank" '+
		'href=http://stackoverflow.com/users/' + theAnswerer.user.user_id + ' >' +
		theAnswerer.user.display_name +
		'</a><br/>' + '<img src=' + theAnswerer.user.profile_image +'/>');
    
    //set reputation property
    var reputation = result.find('.reputation');
    reputation.text(' ' + theAnswerer.user.reputation);
    
    //set score property
    var score = result.find('.score');
    score.text(' ' + theAnswerer.score);
    
    //set post_count property
    var postCount = result.find('.post-count');
    postCount.text(' ' + theAnswerer.post_count);
    
    return result;
};

//takes the object of top answerers and returns the number of returned answerers and appends that figure to DOM
var showSearchResults = function(query, resultNum) {
	var results = 'These are the top ' + resultNum + ' answerers for <strong>' + query + '</strong>:';
	return results;
};

//similar to above ajax function, but gets top answerers
var getTopAnswerers = function(tag) {
	//parameters needed to pass into StackOverflow's API
	var request = { 
		tag: tag,
		site: 'stackoverflow'
	};
    
    $.ajax({
		url: "http://api.stackexchange.com/2.2/tags/" + encodeURIComponent(tag) + "/top-answerers/all_time",
		data: request,
		dataType: "jsonp",
		type: "GET",
	})
    .done(function(result){ //this waits for the ajax to return with a succesful promise object
        console.log(result);
		var searchResults = showSearchResults(request.tag, result.items.length);

		$('.search-results').html(searchResults);
        
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var answerer = showAnswerer(item);
			$('.results').append(answerer);
		});
	})
    .fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};
//.fail with event handler that will show error message as an appended element in search-results

$(document).ready( function() {
	$('.unanswered-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html(" ");
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});
    
    //code to execute ajax request for top answerers upon submit of form
    $('.inspiration-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tag = $(this).find("input[name='answerers']").val();
		getTopAnswerers(tag);
	});
});
