const fs = require('fs');
const path = require('path');

const jsonHandler = require('./jsonResponses.js');

// load dataset once at startup
const rawData = fs.readFileSync(path.resolve(__dirname, '../data/pokedex.json'));
let pokemonData = JSON.parse(rawData);

/*
	GET /pokemon
	Supports optional filtering by type and name
*/
const getPokemon = (request, response, query) => {
	let results = pokemonData;

	if (query.type) {
		results = results.filter((p) => p.type.includes(query.type));
	}

	if (query.name) {
		results = results.filter(
			(p) => p.name.toLowerCase() === query.name.toLowerCase(),
		);
	}

	return jsonHandler.respondJSON(request, response, 200, results);
};

/*
	GET /pokemonById?id=#
*/
const getPokemonById = (request, response, query) => {
	if (!query.id) {
		return jsonHandler.respondJSON(request, response, 400, {
			message: 'id parameter is required',
		});
	}

	const found = pokemonData.find(
		(p) => p.id === parseInt(query.id, 10),
	);

	if (!found) {
		return jsonHandler.respondJSON(request, response, 404, {
			message: 'Pokemon not found',
		});
	}

	return jsonHandler.respondJSON(request, response, 200, found);
};

/*
	GET /types
*/
const getTypes = (request, response) => {
	const types = new Set();

	pokemonData.forEach((p) => {
		p.type.forEach((t) => types.add(t));
	});

	return jsonHandler.respondJSON(
		request,
		response,
		200,
		Array.from(types),
	);
};

/*
	GET /stats
*/
const getStats = (request, response) => {
	const stats = {
		totalPokemon: pokemonData.length,
	};

	return jsonHandler.respondJSON(request, response, 200, stats);
};

/*
	POST /addPokemon
	Now supports optional img field
*/
const addPokemon = (request, response) => {
	const { name, type, img } = request.body;

	if (!name || !type) {
		return jsonHandler.respondJSON(request, response, 400, {
			message: 'name and type are required',
		});
	}

	const newPokemon = {
		id: pokemonData.length + 1,
		name,
		type: Array.isArray(type) ? type : [type],
		img: img || null, // optional image support
	};

	pokemonData.push(newPokemon);

	return jsonHandler.respondJSON(request, response, 201, newPokemon);
};

/*
	POST /editPokemon
	Now supports editing img
*/
const editPokemon = (request, response) => {
	const { id, name, type, img } = request.body;

	if (!id) {
		return jsonHandler.respondJSON(request, response, 400, {
			message: 'id is required',
		});
	}

	const pokemon = pokemonData.find(
		(p) => p.id === parseInt(id, 10),
	);

	if (!pokemon) {
		return jsonHandler.respondJSON(request, response, 404, {
			message: 'Pokemon not found',
		});
	}

	if (name) pokemon.name = name;

	if (type) {
		pokemon.type = Array.isArray(type) ? type : [type];
	}

	if (img !== undefined) {
		pokemon.img = img;
	}

	response.writeHead(204);
	return response.end();
};

module.exports = {
	getPokemon,
	getPokemonById,
	getTypes,
	getStats,
	addPokemon,
	editPokemon,
};