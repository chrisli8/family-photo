// Christopher Li, INFO 343 C, 10/27/15
//The following is the javascript that makes the reviews page functional.
//It uses Parse to manage data

// Initialize Parse app
Parse.initialize('SjtD1xSvCXAdYOCxvLRFiqpdX2dhuXYhauUzHLfd', 'Gwk2wsBtDhYIGbJDNCLIDaUP0o4mpuukrqtVPwMq');

// Create a new sub-class of the Parse.Object, with name "Reviews"
var Reviews = Parse.Object.extend('Reviews');

//global variable for calculating the average rating
var totalStars = 0;
var numberRatings = 0;

//make rating div into star rating system
$('#rate').raty();
//gets the score of the rating when ever the stars div is clicked
var stars = 0;
$('#rate').raty({
  click: function(score, evt) {
    stars = score;
  }
});

// Click event when form is submitted
$('form').submit(function() {
	numberRatings = 0;
	totalStars = 0;
	// Create a new instance of Reviews class
	var reviews = new Reviews();

	// For each input element, set a property of your new instance equal to the input's value
	
	$(this).find('input').each(function() {
		reviews.set($(this).attr('id'), $(this).val());
		$(this).val('');
	})

	//seting attributes of Review class from filled out form
	var reviewText = $('textarea');
	reviews.set('review', reviewText.val());
	reviewText.val('');

	reviews.set('stars', "" + stars);

	reviews.set('thumbsUp', '0');

	// After setting each property, saves new instance back to database
	reviews.save(null, {
		success:getData,
		error:er
	})
	//clears the selected stars rating
	$('#rate').raty('reload');

	return false
})

//error function if parse save fails
var er = function() {
	alert("error");
}

//function to get data
var getData = function() {
	
	// Sets up a new query for Reviews class
	var query = new Parse.Query(Reviews)

	// Sets parameters for query -- where the website property isn't missing
	query.notEqualTo('title', '')
	query.notEqualTo('review', '')
	query.notEqualTo('stars', '')
	query.notEqualTo('thumbsUp', '')

	/* Executes the query using ".find".  When successful:
	    - Pass the returned data into the buildList function
	*/
	query.find({
		success:function(results) {
			buildList(results)
		} 
	})
}

// A function to build a list of reviews
var buildList = function(data) {

	// Empty out your ordered list
	$('ol').empty()

	// Loops through data, and pass each element to the addItem function
	data.forEach(function(d){
		addItem(d);
	})
	updateRating();
}

var updateRating = function() {
	$('#picture_rate').raty({readOnly:true, score:totalStars/numberRatings});	
}


// This function takes in an item, adds it to the screen
var addItem = function(item) {
	numberRatings++;
	// Get parameters (title, review, stars, thumbsUp) from the data item passed to the function
	var title = item.get('title');
	var review = item.get('review');
	var stars = item.get('stars');
	var thumbsUp = item.get('thumbsUp');
	//updates total stars variable
	totalStars += parseInt(stars);
	
	// Append li that includes text from the data item
	var divStars = $('<div>').raty({readOnly:true, score:stars});
	var span = $('<span>').text(title);
	var text = $('<text>').text(review);
	var br = $('<br>');
	var li = $('<li>');
	li.append(span);
	li.append(br);
	li.append(text);

	// var li = $('<li><span>' + title + '</span><br><text>' + review + '</text></li>');
	li.prepend(divStars);
	// Creates buttons with a <span> element (using bootstrap class to show the X and d= and =p)
	var buttonDelete = $('<button class="btn-danger btn-xs"><span class="glyphicon glyphicon-remove"></span></button>');
	var buttonUp = $('<button class="btn-success btn-xs side"><span class="glyphicon glyphicon-thumbs-up"></span></button>');
	var buttonDown = $('<button class="btn-danger btn-xs side"><span class="glyphicon glyphicon-thumbs-down"></span></button>');
	var totalUp = $('<span class="side">' + parseInt(thumbsUp) + '</span>');
	// Click function on the button to destroy the item, then re-calls getData
	buttonDelete.click(function() {
		numberRatings--;
		item.destroy({
			success:getData
		});
	});
	// Click function on the button to upvote the item, then re-calls getData
	buttonUp.click(function() {
		item.set('thumbsUp', 1 + parseInt(thumbsUp) + "");
		item.save(null, {
			success:getData,
			error:er
		})
	});
	// Click function on the button to downvote the item, then re-calls getData
	buttonDown.click(function() {
		item.set('thumbsUp', parseInt(thumbsUp) - 1 + "");
		item.save(null, {
			success:getData,
			error:er
		})
	});

	// Appends the buttons to the li, then the li to the ol
	li.append(buttonDelete);
	li.append(buttonUp);
	li.append(totalUp);
	li.append(buttonDown);
	$('ol').append(li)
	
}

// Calls getData function when the page loads
getData()