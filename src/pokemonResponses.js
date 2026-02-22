const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const jsonHandler = require('./jsonResponses.js');

// load dataset once at startup
const rawData = fs.readFileSync(path.resolve(__dirname, '../data/pokedex.json'));
let pokemonData = JSON.parse(rawData);

// GET /pokemon
const getPokemon = (request, response, query) => {
	let results = pokemonData;

	// filter by type if provided
	if (query.type) {
		results = results.filter((p) => p.type.includes(query.type));
	}

	// filter by name if provided
	if (query.name) {
		results = results.filter((p) => p.name.toLowerCase() === query.name.toLowerCase());
	}

	jsonHandler.respondJSON(request, response, 200, results);
};

const getPokemonMeta = (request, response, query) => {
	getPokemon(request, response, query);
};

// GET /pokemonById?id=25
const getPokemonById = (request, response, query) => {
	if (!query.id) {
		return jsonHandler.respondJSON(request, response, 400, {
			message: 'id parameter is required',
		});
	}

	const found = pokemonData.find((p) => p.id === parseInt(query.id, 10));

	if (!found) {
		return jsonHandler.respondJSON(request, response, 404, {
			message: 'Pokemon not found',
		});
	}

	jsonHandler.respondJSON(request, response, 200, found);
};

const getPokemonByIdMeta = (request, response, query) => {
	getPokemonById(request, response, query);
};

// GET /types
const getTypes = (request, response) => {
	const types = new Set();

	pokemonData.forEach((p) => {
		p.type.forEach((t) => types.add(t));
	});

	jsonHandler.respondJSON(request, response, 200, Array.from(types));
};

const getTypesMeta = (request, response) => {
	getTypes(request, response);
};

// GET /stats
const getStats = (request, response) => {
	const stats = {
		totalPokemon: pokemonData.length,
	};

	jsonHandler.respondJSON(request, response, 200, stats);
};

const getStatsMeta = (request, response) => {
	getStats(request, response);
};

// POST /addPokemon
const addPokemon = (request, response) => {
	let body = '';

	request.on('data', (chunk) => {
		body += chunk;
	});

	request.on('end', () => {
		let parsedBody;

		if (request.headers['content-type'] === 'application/json') {
			parsedBody = JSON.parse(body);
		} else {
			parsedBody = querystring.parse(body);
		}

		if (!parsedBody.name || !parsedBody.type) {
			return jsonHandler.respondJSON(request, response, 400, {
				message: 'name and type are required',
			});
		}

		const newPokemon = {
			id: pokemonData.length + 1,
			name: parsedBody.name,
			type: Array.isArray(parsedBody.type) ? parsedBody.type : [parsedBody.type],
		};

		pokemonData.push(newPokemon);

		jsonHandler.respondJSON(request, response, 201, newPokemon);
	});
};

// POST /editPokemon
const editPokemon = (request, response) => {
	let body = '';

	request.on('data', (chunk) => {
		body += chunk;
	});

	request.on('end', () => {
		let parsedBody;

		if (request.headers['content-type'] === 'application/json') {
			parsedBody = JSON.parse(body);
		} else {
			parsedBody = querystring.parse(body);
		}

		if (!parsedBody.id) {
			return jsonHandler.respondJSON(request, response, 400, {
				message: 'id is required',
			});
		}

		const pokemon = pokemonData.find((p) => p.id === parseInt(parsedBody.id, 10));

		if (!pokemon) {
			return jsonHandler.respondJSON(request, response, 404, {
				message: 'Pokemon not found',
			});
		}

		if (parsedBody.name) pokemon.name = parsedBody.name;
		if (parsedBody.type) {
			pokemon.type = Array.isArray(parsedBody.type)
				? parsedBody.type
				: [parsedBody.type];
		}

		response.writeHead(204);
		response.end();
	});
};

module.exports = {
	getPokemon,
	getPokemonMeta,
	getPokemonById,
	getPokemonByIdMeta,
	getTypes,
	getTypesMeta,
	getStats,
	getStatsMeta,
	addPokemon,
	editPokemon,
};