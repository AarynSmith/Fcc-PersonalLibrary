/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const {ObjectID} = require('bson');

const ObjectId = require('mongodb').ObjectId;

module.exports = function(app, database) {

  app.route('/api/books')
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      database.find(
        {},
        {projection: {comments: 0}}
      ).toArray((err, data) => {
        if (err) return res.status(500).type('text').send(err);
        res.json(data)
      });
    })

    .post(function(req, res) {
      //response will contain new book object including atleast _id and title
      let title = req.body.title;
      if (!title) return res.status(400).type('text').send('missing title');
      const book = {
        title,
        commentcount: 0,
        comments: [],
      }
      database.insertOne(book, (err, data) => {
        if (err) return res.status(500).type('text').send(err);
        delete data.ops[0].commentcount;
        res.json(data.ops[0]);
      })
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      database.deleteMany({}, (err, data) => {
        if (err) return res.status(500).type('text').send(err);
        res.type('text').send('complete delete successful');
      });
    });



  app.route('/api/books/:id')
    .get(function(req, res) {
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      let bookID = req.params.id;
      database.findOne({_id: ObjectId(bookID)},
        {projection: {commentcount: 0}},
        (err, data) => {
          if (err) return res.status(500).type('text').send(err);
          if (!data) return res.type('text').send('no book found');
          res.json(data);
        });
    })

    .post(function(req, res) {
      //json res format same as .get
      let bookID = req.params.id;
      let comment = req.body.comment;
      if (!comment) return res.type('text').send('no comment text')
      database.findOneAndUpdate(
        {_id: ObjectId(bookID)},
        {
          $inc: {commentcount: 1},
          $push: {comments: comment}
        },
        {
          projection: {commentcount: 0},
          returnOriginal: false
        },
        (err, data) => {
          if (err) return res.status(500).type('text').send(err)
          if (!data.value) return res.type('text').send('no book found');
          res.json(data.value);
        });
    })

    .delete(function(req, res) {
      //if successful response will be 'delete successful'
      let bookID = req.params.id;
      database.findOneAndDelete(
        {_id: ObjectID(bookID)},
        (err, data) => {
          if (err) return res.status(500).type('text').send(err)
          if (!data.value) return res.type('text').send('no book found');
          res.type('text').send('delete successful');
        });
    });
};
