const express = require('express');
const router = express.Router();

router.use(express.json());

const {Author, BlogPost} = require('./models');

/*
// send back JSON representation of all authors
// on GET requests to root
router.get('/', (req, res) => {
    Author
      .find()
      // success callback: for each author we got back, we'll
      // map only the data we want the API to return.
      .then(authors => {
        res.json(authors.map(author => {
          return {
            title: blogpost.title,
            content: blogpost.content,
            author: blogpost.authorFullName,
            created: blogpost.created
          };
        }));
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
  });
*/

  // when new blog post added, ensure has required fields. if not,
// log error and return 400 status code with helpful message.
// if okay, add new blog post, and return it with a status 201.
router.post('/', (req, res) => {

    const requiredFields = ['firstName', 'lastName', 'userName'];
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }
  
    Author
      .findOne({userName: req.body.userName})
      .then(author => {
        if (!author) {
          Author
            .create({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              userName: req.body.userName
            })
            .then(author => res.status(201).json({
              id: author._id,
              name: `${author.firstName} ${author.lastName}`.trim(),
              userName: author.userName,
            }))
            .catch(err => {
              console.error(err);
              res.status(500).json({ message: 'Internal server error' });
            });
        } else {
          const message = `An author already exists with this user name`;
          console.error(message);
          return res.status(400).send(message);
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
  });

  // when PUT request comes in with updated author, ensure has
// required fields. also ensure that author id in url path, and
// author id in updated item object match. if problems with any
// of that, log error and send back status code 400. otherwise
// update author, and return it with a status 200.
router.put('/:id', (req, res) => {
    // ensure that the id in the request path and the one in request body match
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
      const message = (
        `Request path id (${req.params.id}) and request body id ` +
        `(${req.body.id}) must match`);
      console.error(message);
      return res.status(400).json({ message: message });
    }
  
    // we only support a subset of fields being updateable.
    // if the user sent over any of the updatableFields, we udpate those values
    // in document
    const toUpdate = {};
    const updateableFields = ['firstName', 'lastName', 'userName'];
  
    updateableFields.forEach(field => {
      if (field in req.body) {
        toUpdate[field] = req.body[field];
      } 
    });
  
    Author
      .findOne({userName: req.body.userName})
      .then(author => {
        if (!author) {
            Author
                // all key/value pairs in toUpdate will be updated -- that's what `$set` does
                .findByIdAndUpdate(req.params.id, { $set: toUpdate }, {new: true})
                .then(updatedAuthor => res.status(200).json({
                    id: updatedAuthor._id,
                    name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`.trim(),
                    userName: updatedAuthor.userName,
                }))
                .catch(err => res.status(500).json({ message: 'Internal server error' }));
        } else {
            const message = `An author already exists with this user name`;
            console.error(message);
            return res.status(400).send(message);
        }
    });
});

// Delete authors (by id)!
router.delete('/:id', (req, res) => {
  BlogPost
    .remove({author: req.params.id})
    .then(() => {
      Author
        .findByIdAndRemove(req.params.id)
        .then(() => res.status(204).end())
    }) 
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = router;