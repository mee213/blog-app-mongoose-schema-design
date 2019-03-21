'use strict';

const mongoose = require('mongoose');

// schema to represent authors
const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

// schema to represent comments
const commentSchema = mongoose.Schema({ content: 'string' });

// this is our schema to represent a blog post
const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  comments: [commentSchema],
  created : {
    type : Date,
    default : Date.now
  }
});

// pre hook for author for find (All) blog posts
blogPostSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

// pre hook for author for findOne blog post
blogPostSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

// pre hook for author for findByIdAndUpdate blog post
// (findOneAndUpdate is used under the hood)
blogPostSchema.pre('findOneAndUpdate', function(next) {
  this.populate('author');
  next();
});

// *virtuals* (http://mongoosejs.com/docs/guide.html#virtuals)
// allow us to define properties on our object that manipulate
// properties that are stored in the database. Here we use it
// to generate a human readable string based on the author object
// we're storing in Mongo.
blogPostSchema.virtual('authorFullName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim()});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
blogPostSchema.methods.serialize = function() {

  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorFullName,
    created: this.created,
    comments: this.comments
  };
}

// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.
const Author = mongoose.model('Author', authorSchema);
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {Author, BlogPost};