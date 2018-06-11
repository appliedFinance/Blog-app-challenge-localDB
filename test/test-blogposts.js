'use strict'

// require modules

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should()

const {BlogPost} = require('../models');
const {closeServer, runServer, app} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const say = console.log;

chai.use(chaiHttp);

function clearDataBase() {
	return new Promise(function(res,req) {
		say("Deleting DB data");
		mongoose.connection.dropDatabase().then(res=>resolve(res)).catch(err=>reject(err));
	});
}

function createFakeBlogpost() {
	say('creating random blog post');
	const seedData = [];
	for(let i=1; i<=3; i++) {
		seedData.push(
				{ "author": {"firstName": faker.name.firstName(),
								 "lastName":  faker.name.lastName()
								},
				  "title": faker.lorem.sentence(),
				  "content": faker.lorem.text()
				});
	}
	// write using Mongoose
	return BlogPost.insertMany(seedData);
}




describe('Test the BlogPost API', function() {

	before(function() { return runServer(TEST_DATABASE_URL); });

	after(function() { return closeServer(); });

	beforeEach(function() { return seedBlogPostData(); }); 

	afterEach(function() { return closeServer(); });

	describe('GET endpoint', function() {

		let res;

		it('should return all existing BlogPosts', function() {
			// count things
			return chai.request(app)
			.get('/posts')
			.then( function( _res) {
				res = _res;
				res.should.have.status(200);
				res.body.should.have.lengthOf.at.least(1);
				return BlogPost.count();
			})
			.then( function(count) {
				res.body.should.have.lengthOf(count);
			});
		});

	});//GET

	/*
	describe('POST endpoint', function() {
		// one thing
		
		// all things
	});

	describe('PUT endpoint', function() {

	});

	describe('DELETE endpoint', function() {

	});
   */

});


