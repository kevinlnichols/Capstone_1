//capstone

function startSearch () {
	$('#start-button').on('click', function() {
		$('#search').removeClass('hidden');
		$('#start-button').addClass('hidden');
	});
}

//Get Youtube API data

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_API_KEY = 'AIzaSyCXn1s41z5eUTYyq5L2JAc4YZpao_7ephk';
const YOUTUBE_WATCH_URL = "https://www.youtube.com/watch?v=";
var PREV_TOKEN = '';
var NEXT_TOKEN = '';
let query = '';

function makeYoutubeQuery (searchTerm, task) {
	const query = {
		part: 'snippet',
		key: YOUTUBE_API_KEY,
		q: 'info about ' + searchTerm,
		maxResults: 3,
		relevanceLanguage: 'en'
	}; 
	if (task === 'next') {
		query.pageToken = NEXT_TOKEN;
	}
	if (task === 'prev') {
		query.pageToken = PREV_TOKEN;
	}
	return query;
}

function getDataFromYoutubeApi (query, callback) {
	$.getJSON(YOUTUBE_SEARCH_URL, query, callback);
}

function renderYTResult (result) {
	PREV_TOKEN = result.prevPageToken;
	NEXT_TOKEN = result.nextPageToken;
	$('.yt-results').html(" ");
	$('.yt-results').append(`
		<h5 class="header">CLICK ON A THUMBNAIL TO VIEW ON YOUTUBE.</h5>
		`);
	result.items.forEach((item) => {
	$('.yt-results').append(`
		<div class="yt-2 ">
				<p class="yt-title">Title: ${item.snippet.title}</p>
		</div>
		<div class="yt-row">
			<div class="yt-1 yt-info">
				<a href="${YOUTUBE_WATCH_URL + item.id.videoId}" target="_blank"><img class="yt-thumb highlight" src="${item.snippet.thumbnails.medium.url}" alt="Link to Youtube video titled ${item.snippet.title}"></a>
			</div>
		</div>
	`);
	});
	$('.yt-results').append(`
		<div class="search-buttons">
			<button class="highlight browse yt-previous">Previous</button>
			<button class="highlight browse yt-next">Next</button>
		</div>
	`);
	$('.yt-next').click(function() {
		$('.yt-previous').removeAttr('disabled');
		getDataFromYoutubeApi(makeYoutubeQuery(query, 'next'), renderYTResult);
	});
	$('.yt-previous').click(function() {
		getDataFromYoutubeApi(makeYoutubeQuery(query, 'prev'), renderYTResult);
		if (PREV_TOKEN == undefined) {
			$('.yt-previous').attr('disabled', true);
		}
	});
}

function clearYTResult () {
	$('.yt-results').empty();
	$('.wiki-results').empty();
	$('.gb-results').empty();
}

function watchSubmit () {
	$('.js-search').submit((event) => {
	$('#results').removeClass('hidden');
	event.preventDefault();
	const queryTarget = $(event.currentTarget).find('.js-query');
	query = queryTarget.val().toLowerCase();
	queryTarget.val("");
	getDataFromYoutubeApi(makeYoutubeQuery(query, null), renderYTResult);
	getDataFromWikiApi(query);
	getDataFromGoogleBooksApi(query, renderGBResult);
	});
}

$(function () {
	watchSubmit();
	startSearch();
});

//Get Wikipedia API data

function getDataFromWikiApi(title) {
        var url = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts%7Cpageimages&redirects=1&piprop=thumbnail%7Cname%7Coriginal&exsentences=5&list=&titles=" + title + "&callback=?";
        var queryData = "";
        $.ajax({
            url: url,
            data: queryData,
            dataType: 'json',
            success: function renderWikiResult (data) {
            	$('.wiki-results').html(" ");
                var pages = data.query.pages;
                console.log(pages);
                for (var id in pages) {
                	if (pages[id].original !== undefined && pages[id].extract !== undefined) {
                		pages[id].original = pages[id].original ? pages[id].original:{source:""};
                        	$('.wiki-results').append(`
                        		<div class="wiki-row">
                        			<div class="container">
                        				<a href="${pages[id].original.source}" target="_blank"><img class="highlight wiki-pic" src="${pages[id].original.source}" alt="Main page image for ${pages[id].title} search"></a>
                        			</div>
                        			<h2 class="header-wiki">${pages[id].title}</h2>
                        			<p>${pages[id].extract}</p>
                        		</div>`);
                	} 
	                else if (pages[id].extract !== undefined) {
	                	$('.wiki-results').append(`
                        		<div class="wiki-row">
                        			<h2 class="header-wiki">${pages[id].title}</h2>
                        			<p>${pages[id].extract}</p>
                        		</div>`);
	                }
	                else {
	                    $('.wiki-results').append(`<h2>${pages[id].title}</h2>`);
	                    $('.wiki-results').append('<p>No results were found. Check for any spelling errors and try spelling out acronyms.</p>');
	                }
	            }
            }

        });
}



//Get Google Books API data

let bookIndex = 0;

function getDataFromGoogleBooksApi (searchTerm, callback) {
	var url = 'https://www.googleapis.com/books/v1/volumes?q=' + searchTerm;
	const query = {
		key: 'AIzaSyCXn1s41z5eUTYyq5L2JAc4YZpao_7ephk',
		q: searchTerm,
		filter: 'free-ebooks',
		maxResults: 3,
		orderBy: 'relevance',
		startIndex: bookIndex
	};
	$.getJSON(url, query, callback);
}

function renderGBResult (result) {
	$('.gb-results').html(" ");
	$('.gb-results').append(`
		<h5 class="header">CLICK ON A THUMBNAIL TO VIEW ON GOOGLE PLAY.</h5>
		`);
	result.items.forEach((item) => {
		if (item.volumeInfo.subtitle !== undefined && item.volumeInfo.authors !== undefined) {
			$('.gb-results').append(`
			<div class="gb-row">
				<div class="gb-1">
					<a href="${item.volumeInfo.canonicalVolumeLink}" target="_blank"><img class="highlight gb-thumbs" src="${item.volumeInfo.imageLinks.thumbnail}" alt="Thumbnail for the book called ${item.volumeInfo.title}"></a>
				</div>
				<div class="gb-2">
					<h4>Title: ${item.volumeInfo.title}</h4>
					<h6>${item.volumeInfo.subtitle}</h6>
					<p>Author: ${item.volumeInfo.authors}</p>
				</div>
			</div>
			`);
		}
		else if (item.volumeInfo.subtitle === undefined && item.volumeInfo.authors !== undefined) {
			$('.gb-results').append(`
			<div class="gb-row">
				<div class="gb-1">
					<a href="${item.volumeInfo.canonicalVolumeLink}" target="_blank"><img class="highlight gb-thumbs" src="${item.volumeInfo.imageLinks.thumbnail}" alt="Thumbnail for the book called ${item.volumeInfo.title}"></a>
				</div>
				<div class="gb-2">
					<h4>Title: ${item.volumeInfo.title}</h4>
					<h6>No subtitle available.</h6>
					<p>Author: ${item.volumeInfo.authors}</p>
				</div>
			</div>
			`);
		}
		else if (item.volumeInfo.subtitle !== undefined && item.volumeInfo.authors === undefined) {
			$('.gb-results').append(`
			<div class="gb-row">
				<div class="gb-1">
					<a href="${item.volumeInfo.canonicalVolumeLink}" target="_blank"><img class="highlight gb-thumbs" src="${item.volumeInfo.imageLinks.thumbnail}" alt="Thumbnail for the book called ${item.volumeInfo.title}"></a>
				</div>
				<div class="gb-2">
					<h4>Title: ${item.volumeInfo.title}</h4>
					<h6>${item.volumeInfo.subtitle}</h6>
					<p>Author: No author listed.</p>
				</div>
			</div>
			`);
		}
		else if (item.volumeInfo.subtitle === undefined && item.volumeInfo.authors === undefined) {
			$('.gb-results').append(`
			<div class="gb-row">
				<div class="gb-1">
					<a href="${item.volumeInfo.canonicalVolumeLink}" target="_blank"><img class="highlight gb-thumbs" src="${item.volumeInfo.imageLinks.thumbnail}" alt="Thumbnail for the book called ${item.volumeInfo.title}"></a>
				</div>
				<div class="gb-2">
					<h4>Title: ${item.volumeInfo.title}</h4>
					<h6>No subtitle available.</h6>
					<p>Author: No author listed.</p>
				</div>
			</div>
			`);
		}	
	});
	$('.gb-results').append(`
		<div class="search-buttons">
			<button class="highlight browse gb-previous">Previous</button>
			<button class="highlight browse gb-next">Next</button>
		</div>
	`);
	$('.gb-next').click(function() {
		bookIndex += 3;
		getDataFromGoogleBooksApi(query, renderGBResult);
	});
	$('.gb-previous').click(function() {
		if (bookIndex !== 0) {
			bookIndex -= 3;
		}
		getDataFromGoogleBooksApi(query, renderGBResult);
	});
}