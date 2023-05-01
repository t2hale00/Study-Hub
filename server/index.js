"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const uuid_1 = require("uuid");
//this is to parse request body for POST requests
const app = (0, express_1.default)();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const port = 3002;
app.post('/register', (req, res) => {
    const pool = openDb();
    pool.query('insert into users (name, email, pwdhash) values ($1, $2, $3) returning *', [req.body.name, req.body.email, req.body.pwdhash], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.status(201).json({ name: result.rows[0].name });
    });
});
app.post('/login', (req, res) => {
    const pool = openDb();
    pool.query('select * from users where email = $1 and pwdhash = $2', [req.body.email, req.body.pwdhash], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        if (result.rows.length === 0) {
            res.status(403).json({ result: 'forbidden' });
        }
    });
    let auth = (0, uuid_1.v4)();
    pool.query('UPDATE users SET auth_id = $1 WHERE email = $2 returning *', [auth, req.body.email], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.status(200).json({ email: result.rows[0].email, auth: result.rows[0].auth_id });
    });
});
app.post('/questions', (req, res) => {
    const pool = openDb();
    let user_name = "";
    pool.query('select * from users where auth_id = $1 and user_id = $2', [req.query.auth_id, req.body.user_id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        if (result.rows.length === 0) {
            res.status(403).json({ result: 'forbidden' });
        }
        user_name = result.rows[0].name;
    });
    pool.query('insert into question (user_id, questions) values ($1, $2) returning *', [req.body.user_id, req.body.questions], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.status(201).json({ name: user_name, question: result.rows[0].questions });
    });
});
app.get('/questions', (req, res) => {
    const pool = openDb();
    pool.query('select u.name, q.question_id, q.questions, q.created_at from question q join users u on q.user_id = u.user_id', (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.status(200).json(result.rows);
    });
});
app.post('/addcomment', (req, res) => {
    const pool = openDb();
    let user_id;
    pool.query('select * from users where auth_id = $1', [req.query.auth_id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        if (result.rows.length === 0) {
            res.status(403).json({ result: 'forbidden' });
        }
        user_id = result.rows[0].user_id;
    });
    pool.query('insert into comments (question_id, comment, user_id) values ($1, $2, $3) returning *', [req.body.question_id, req.body.comment, req.body.user_id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.status(201).json(result.rows);
    });
});
app.post('/addcomment', (req, res) => {
    const pool = openDb();
    let user_id;
    pool.query('select * from users where auth_id = $1', [req.query.auth_id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        if (result.rows.length === 0) {
            res.status(403).json({ result: 'forbidden' });
        }
        user_id = result.rows[0].user_id;
    });
    pool.query('insert into comments (question_id, comment, user_id) values ($1, $2, $3) returning *', [req.body.question_id, req.body.comment, req.body.user_id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.status(201).json(result.rows);
    });
});
app.delete('/question/:query_id', (req, res) => {
    const pool = openDb();
    pool.query('select * from users u join question q on u.user_id = q.user_id where u.auth_id = $1 and q.question_id = $2', [req.query.auth_id, req.params.query_id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        if (result.rows.length === 0) {
            res.status(403).json({ result: 'forbidden' });
        }
    });
    pool.query('delete from question where question_id = $1', [req.params.query_id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.status(200).json({ result: "success" });
    });
});
const openDb = () => {
    const pool = new pg_1.Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'studyhub',
        password: '1234',
        port: 5432,
    });
    return pool;
};
app.listen(port);
