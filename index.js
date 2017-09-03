//capstone

//Get Youtube API data

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_API_KEY = 'AIzaSyCXn1s41z5eUTYyq5L2JAc4YZpao_7ephk';
const YOUTUBE_WATCH_URL = "https://www.youtube.com/watch?v=";

function getDataFromYoutubeApi (searchTerm, callback) {
	const query = {
		part: 'snippet',
		key: YOUTUBE_API_KEY,
		q: searchTerm,
		maxResults: 4
	};
	$.getJSON(YOUTUBE_SEARCH_URL, query, callback);
}

function renderYTResult (result) {
	$('.js-results').html(" ");
	result.items.forEach((item) => {
	$('.js-results').append(`
	<div class="youtube">
		<div class="yt-thumb">
			<p>${item.snippet.title}</p>
		</div>
		<div class="yt-info">
			<a href="${YOUTUBE_WATCH_URL + item.id.videoID}" target="_blank"><img src="${item.snippet.thumbnails.default.url}" alt="Link to Youtube video titled ${item.snippet.title}"></a>
		</div>
	</div>
	`);
	});
}

function clearYTResult () {
	$('.js-results').empty();
}

function watchSubmit () {
	$('.js-search').submit((event) => {
	event.preventDefault();
	const queryTarget = $(event.currentTarget).find('.js-query');
	const query = queryTarget.val();
	queryTarget.val(" ");
	getDataFromYoutubeApi(query, renderYTResult);
	});
}

$(function () {watchSubmit();});