const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const pokemonHandler = require('./pokemonResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// routing logic
const onRequest = (request, response) => {
	const parsedUrl = url.parse(request.url, true);
	const pathname = parsedUrl.pathname;

	switch (pathname) {
		case '/pokemon':
			if (request.method === 'GET') {
				pokemonHandler.getPokemon(request, response, parsedUrl.query);
			} else if (request.method === 'HEAD') {
				pokemonHandler.getPokemonMeta(request, response, parsedUrl.query);
			} else {
				jsonHandler.notFound(request, response);
			}
			break;

		case '/pokemonById':
			if (request.method === 'GET') {
				pokemonHandler.getPokemonById(request, response, parsedUrl.query);
			} else if (request.method === 'HEAD') {
				pokemonHandler.getPokemonByIdMeta(request, response, parsedUrl.query);
			} else {
				jsonHandler.notFound(request, response);
			}
			break;

		case '/types':
			if (request.method === 'GET') {
				pokemonHandler.getTypes(request, response);
			} else if (request.method === 'HEAD') {
				pokemonHandler.getTypesMeta(request, response);
			} else {
				jsonHandler.notFound(request, response);
			}
			break;

		case '/stats':
			if (request.method === 'GET') {
				pokemonHandler.getStats(request, response);
			} else if (request.method === 'HEAD') {
				pokemonHandler.getStatsMeta(request, response);
			} else {
				jsonHandler.notFound(request, response);
			}
			break;

		case '/addPokemon':
			if (request.method === 'POST') {
				pokemonHandler.addPokemon(request, response);
			} else {
				jsonHandler.notFound(request, response);
			}
			break;

		case '/editPokemon':
			if (request.method === 'POST') {
				pokemonHandler.editPokemon(request, response);
			} else {
				jsonHandler.notFound(request, response);
			}
			break;
        case '/':
	        fs.readFile(path.resolve(__dirname, '../client/index.html'), (err, data) => {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(data);
	        });
	        break;
		default:
			jsonHandler.notFound(request, response);
			break;
	}
};

http.createServer(onRequest).listen(port);