var Author = require('../models/author');
var async = require('async');
var Book = require('../models/book');

exports.author_list = function (req, res, next) {
    Author.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_authors) {
            if (err)
                return next(err);
            res.render('author_list', { title: 'Author List', author_list: list_authors });
        });
};

exports.author_detail = function (req, res, next) {
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id).exec(callback);
        },
        author_books: function (callback) {
            Book.find({ 'author': req.params.id }, 'title summary').exec(callback);
        },
    }, function (err, results) {
        if (err)
            return next(err);
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.author_books });
    });
};

exports.author_create_get = function (req, res, next) {
    res.render('author_form', { title: 'Create Author' });
};

exports.author_create_post = function (req, res, next) {
    req.checkBody('first_name', 'First name must be specified').notEmpty();
    req.checkBody('family_name', 'Family name must be specified').notEmpty();
    req.checkBody('family_name', 'Family name must be alphanumeric text').isAlpha();
    req.checkBody('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isDate();
    req.checkBody('date_of_death', 'Invalid date').optional({ checkFalsy: true }).isDate();

    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();
    req.sanitize('family_name').trim();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();

    var errors = req.validationErrors();

    var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
    });

    if (errors) {
        res.render('author_form', { title: 'Create Author', author: author, errors: errors });
        return;
    }
    else {
        author.save(function (err) {
            if (err)
                return next(err);
            res.redirect(author.url);
        });
    }
};

exports.author_delete_get = function (req, res, next) {
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id).exec(callback);
        },
        authors_books: function (callback) {
            Book.find({ 'author': req.params.id }).exec(callback);
        }
    }, function (err, results) {
        if (err)
            return next(err);
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books });
    });
};

exports.author_delete_post = function (req, res) {
    req.checkBody('authorid', 'Author id must exist.').notEmpty();

    async.parallel({
        author: function (callback) {
            Author.findById(req.body.authorid).exec(callback);
        },
        authors_books: function (callback) {
            Book.find({ 'author': req.body.authorid }, 'title summary').exec(callback);
        }
    }, function (err, results) {
        if (err)
            return next(err);
        if (results.authors_books > 0) {
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books });
            return;
        }
        else {
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err)
                    return next(err);
                res.redirect('/catalog/authors');
            });
        }
    });
};

exports.author_update_get = function (req, res) {

};

exports.author_update_post = function (req, res) {

};