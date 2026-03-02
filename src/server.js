const fs = require('fs');
const path = require('path');
const http = require('http');
const query = require('querystring');

const pokemon = require('./pokemonResponses.js');
const jsonHandler = require('./jsonResponses.js');

const index = fs.readFileSync(
	path.resolve(__dirname, '../client/index.html')
);
const docs = fs.readFileSync(
	path.resolve(__dirname, '../client/docs.html')
);

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
	const body = [];

	request.on('error', () => {
		response.statusCode = 400;
		return response.end();
	});

	request.on('data', (chunk) => {
		body.push(chunk);
	});

	request.on('end', () => {
		const bodyString = Buffer.concat(body).toString();
		const type = request.headers['content-type'];

		if (type === 'application/x-www-form-urlencoded') {
			request.body = query.parse(bodyString);
		} else if (type === 'application/json') {
			request.body = JSON.parse(bodyString);
		} else {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify({ error: 'invalid data format' }));
			return response.end();
		}

		handler(request, response);
	});
};

const onRequest = (request, response) => {
	const protocol = request.connection.encrypted ? 'https' : 'http';
	const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

	// Serve index.html at root
	if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
		response.writeHead(200, {
			'Content-Type': 'text/html',
			'Content-Length': index.length,
		});

		response.write(index);
		return response.end();
	}

	// Serve docs page
	if (parsedUrl.pathname === '/docs.html') {
		response.writeHead(200, {
			'Content-Type': 'text/html',
			'Content-Length': docs.length,
		});
		response.write(docs);
		return response.end();
	}

	// POST routes
	if (request.method === 'POST') {
		if (parsedUrl.pathname === '/addPokemon') {
			return parseBody(request, response, pokemon.addPokemon);
		}

		if (parsedUrl.pathname === '/editPokemon') {
			return parseBody(request, response, pokemon.editPokemon);
		}

		return jsonHandler.notFound(request, response);
	}

	// GET / HEAD routes
	if (parsedUrl.pathname === '/pokemon') {
		return pokemon.getPokemon(request, response, parsedUrl.searchParams);
	}
	if (parsedUrl.pathname === '/pokemonById') {
		return pokemon.getPokemonById(request, response, parsedUrl.searchParams);
	}
	if (parsedUrl.pathname === '/types') {
		return pokemon.getTypes(request, response);
	}
	if (parsedUrl.pathname === '/stats') {
		return pokemon.getStats(request, response);
	}
	return jsonHandler.notFound(request, response);
};

http.createServer(onRequest).listen(port);