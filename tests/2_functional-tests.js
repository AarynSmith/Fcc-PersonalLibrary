/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test.skip('#example Test GET /api/books', function(done) {
  //   chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, res) {
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {
    let TestID
    let TestBookTitle = "Big book of POST testing"

    suite('POST /api/books with title => create book object/expect book object', function() {

      test('Test POST /api/books with title', function(done) {
        const testData = {title: TestBookTitle}
        chai.request(server)
          .post('/api/books')
          .send(testData)
          .end(function(err, res) {
            if (err) console.log("Test Error: ", err, res)
            assert.equal(res.status, 200);
            assert.property(res.body, 'title');
            assert.property(res.body, '_id');
            assert.notProperty(res.body, 'commentcount')
            assert.property(res.body, 'comments')
            assert.isArray(res.body.comments)
            assert.equal(res.body.title, testData.title);
            TestID = res.body._id;
            done();
          });
      });

      test('Test POST /api/books with no title given', function(done) {
        const testData = {title: ""}
        chai.request(server)
          .post('/api/books')
          .send(testData)
          .end(function(_, res) {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'missing title')
            done();
          });
      });

    });


    suite('GET /api/books => array of books', function() {

      test('Test GET /api/books', function(done) {
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            if (err) console.log("Test Error: ", err, res)
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.notProperty(res.body[0], 'comments', 'Books in array should not have comments');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function() {

      test('Test GET /api/books/[id] with id not in db', function(done) {
        chai.request(server)
          .get('/api/books/000000000000')
          .end(function(err, res) {
            if (err) console.log("Test Error: ", err, res);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book found');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function(done) {
        chai.request(server)
          .get('/api/books/' + TestID)
          .end(function(err, res) {
            if (err) console.log("Test Error: ", err, res);
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'commentcount', 'Books should not have commentcount');
            assert.property(res.body, '_id', 'Books should contain _id');
            assert.equal(res.body._id, TestID);
            assert.property(res.body, 'title', 'Books should contain title');
            assert.equal(res.body.title, TestBookTitle);
            assert.property(res.body, 'comments', 'Books should contain _id');
            assert.isArray(res.body.comments);
            done();
          });
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function() {

      test('Test POST /api/books/[id] with comment', function(done) {
        chai.request(server)
          .post('/api/books/' + TestID)
          .send({comment: 'test comment'})
          .end(function(err, res) {
            if (err) console.log("Test Error: ", err, res);
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'commentcount', 'Books should not have commentcount');
            assert.property(res.body, '_id', 'Books should contain _id');
            assert.equal(res.body._id, TestID);
            assert.property(res.body, 'title', 'Books should contain title');
            assert.equal(res.body.title, TestBookTitle);
            assert.property(res.body, 'comments', 'Books should contain _id');
            assert.isArray(res.body.comments);
            assert.include(res.body.comments, 'test comment');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done) {
        chai.request(server)
          .post('/api/books/' + TestID)
          .send({comment: ''})
          .end(function(err, res) {
            if (err) console.log("Test Error: ", err, res);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no comment text');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done) {
        chai.request(server)
          .post('/api/books/000000000000')
          .send({comment: 'test comment'})
          .end(function(err, res) {
            if (err) console.log("Test Error: ", err, res);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book found');
            done();
          });
      });

    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done) {
        chai.request(server)
          .delete('/api/books/' + TestID)
          .end(function(err, res) {
            if (err) console.log("Test Error: ", err, res);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done) {
        chai.request(server)
          .delete('/api/books/000000000000')
          .end(function(err, res) {
            if (err) console.log("Test Error: ", err, res);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book found');
            done();
          });
      });

    });

  });

});