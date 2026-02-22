// helper functions for JSON responses

const respondJSON = (request, response, status, object) => {
	const responseBody = JSON.stringify(object);

	response.writeHead(status, {
		'Content-Type': 'application/json',
		'Content-Length': Buffer.byteLength(responseBody),
	});

	if (request.method !== 'HEAD') {
		response.write(responseBody);
	}

	response.end();
};

const notFound = (request, response) => {
	const responseJSON = {
		message: 'The page you are looking for was not found.',
		id: 'notFound',
	};

	respondJSON(request, response, 404, responseJSON);
};

module.exports = {
	respondJSON,
	notFound,
};