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
	return new Promise(function(resolve,reject) {
		say("* Deleting DB data");
		mongoose.connection.dropDatabase().then(result=>resolve(result)).catch(err=>reject(err));
	});
}

function createFakeBlogpost(n) {
	return BlogPost.insertMany(FakeBlogpost(n));
}

function FakeBlogpost(n) {
	// use mongoose to directly wite to db
	const seedData = [];
	for(let i=0; i<1; i++) {
		seedData.push(
				{ "author": {"firstName": faker.name.firstName(),
								 "lastName":  faker.name.lastName()
								},
				  "title": faker.lorem.sentence(),
				  "content": faker.lorem.text()
				});
	}
	return seedData;
}

const NUM = 3; // number of seed posts to generate

describe('Test the BlogPost API', function() {

	before(function()     { return runServer(TEST_DATABASE_URL); });
	after(function()      { return closeServer();              });

	beforeEach(function() { return createFakeBlogpost(NUM);		 });
	afterEach(function()  { return clearDataBase();                });

	// GET
	describe('GET endpoint', function() {
		it('Returns all existing BlogPosts', function() {
			return chai.request(app)
				.get('/posts')
				.then( res => {
					res.should.have.status(200);
					res.body.should.have.lengthOf.at.least(1);
				});
		});
	});//GET 
	
	
	// POST
	describe('POST endpoint', function() {

		it('Adds a new Blog Post', function() {
			return chai.request(app)
				.post('/posts')
				.send(FakeBlogpost(1)[0])
				.then( function(res) {
					// technical stuff
					res.should.have.status(201);
					res.should.be.json;

					// test the data of the post
					let newPost = res.body;
					newPost.should.be.a('object');
					newPost.should.include.keys('id','author','title','content','created');
					//newPost.title.should.equal(tempPost.title);
					newPost.id.should.not.be.null;
					//newPost.author.should.equal(`${tempPost.author.firstName} ${tempPost.author.lastName}`);
					//newPost.content.should.equal(tempPost.content);

				});
		});
	});//POST 
	
	describe('PUT endpoint', function() {
		it('Update fields you previously sent', function() {
			const updatePost = {
				"title": "The Update",
				"content": "One for the money, two for the show.",
				"author": {"firstName": "Jim", "lastName": "Cricket"}
			};

			return BlogPost.findOne().then( post=> {
				// pull out the id from mongo
				updatePost.id = post.id;

				return chai.request(app)
					.put(`/posts/${post.id}`)
					.send(updatePost);
			})
			.then( res=> { 
				res.should.have.status(204);
				// test the body of the result, etc.
				return BlogPost.findById(updatePost.id);
			})
			.then( post=> {
				post.title.should.equal(updatePost.title);
				post.content.should.equal(updatePost.content);
			});

		});
	});//PUT

	describe('DELETE endpoint', function() {
		it('Delete a post by its id', function() {

			let post;

			return BlogPost.findOne().then( _post=> {
				post = _post;
				return chai.request(app).delete(`/posts/${post.id}`);
			})
			.then( res=> {
				res.should.have.status(204);
				return BlogPost.findById(post.id);
			})
			.then( _post=> {
				should.not.exist(_post);
			});
		});
	
	});



});









