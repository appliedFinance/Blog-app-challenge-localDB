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
		say("***** Deleting DB data");
		mongoose.connection.dropDatabase().then(res=>resolve(res)).catch(err=>reject(err));
	});
}

function createFakeBlogpost(n) {
	// use mongoose to directly wite to db
	say('***** creating random blog post');
	const seedData = [];
	for(let i=0; i<n; i++) {
		seedData.push(
				{ "author": {"firstName": faker.name.firstName(),
								 "lastName":  faker.name.lastName()
								},
				  "title": faker.lorem.sentence(),
				  "content": faker.lorem.text()
				});
	}
	// write using Mongoose
	console.log("===============");
	console.log(seedData);
	console.log("===============");
	return BlogPost.insertMany(seedData);
}

const NUM = 3; // number of seed posts to generate

describe('Test the BlogPost API', function() {

	before(function()     { return runServer(TEST_DATABASE_URL); });
	after(function()      { return clearDataBase();              });
	beforeEach(function() { return createFakeBlogpost(NUM)		 });
	afterEach(function()  { return closeServer();                });

/*
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
*/


/*
	// POST
	describe('POST endpoint', function() {
		it('Adds a new Blog Post', function() {
			const tempPost = createFakeBlogpost(1);			

			return chai.request(app)
				.post('/posts')
				.send(tempPost[0])
				.then( function(res) {
					// technical stuff
					res.should.have.status(201);
					//res.should.be.json;

					// test the data of the post
					let newPost = res.body;
					//newPost.should.be.a('object');
					newPost.should.include.keys('id','author','title','content','created');
					//newPost.title.should.equal(tempPost.title);
					//newPost.id.should.not.be.null;
					//newPost.author.should.equal(`${tempPost.author.firstName} ${tempPost.author.lastName}`);
					//newPost.content.should.equal(tempPost.content);

				});
		});
	});//POST 
*/


/*	
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
					.put(`/post/${post.id}`)
					.send(updatePost);
			})
			.then( res=> { 
				res.should.have.status(204);
				return BlogPost.findById(updateData.id);
			})
			.then( post=> {
				post.title.should.equal(updatePost.title);
				post.content.should.equal(updateData.content);
			});

		});
	});//PUT
*/


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









