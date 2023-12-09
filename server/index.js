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
    if (req.body.password != req.body.confirm_password) {
        res.status(400).json({ error: 'confirm password' });
        return;
    }
    pool.query('insert into users (first_name, last_name, user_name, email, password, sex) values ($1, $2, $3, $4, $5, $6) returning *', [req.body.first_name, req.body.last_name, req.body.user_name, req.body.email, req.body.password, req.body.sex], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.status(201).json({ name: result.rows[0].user_name });
    });
});
app.post('/login', (req, res) => {
    const pool = openDb();
    pool.query('select * from users where email = $1 and password = $2', [req.body.email, req.body.pwdhash], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        if (result.rows.length === 0) {
            res.status(403).json({ result: 'forbidden' });
            return;
        }
        if (result.rows.length >= 2) {
            res.status(403).json({ result: 'contact admin' });
            return;
        }
        let auth = (0, uuid_1.v4)();
        pool.query('UPDATE users SET auth_id = $1 WHERE email = $2 returning *', [auth, req.body.email], (error, result) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.status(200).json(result.rows);
        });
    });
});
app.delete('/deleteuser', (req, res) => {
    const pool = openDb();
    pool.query('delete from users where user_name = $1', [req.query.user_name], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.status(200).json(result.rows);
    });
});
app.post('/questions', (req, res) => {
    const pool = openDb();
    let user_name = "";
    let user_id = "";
    pool.query('select * from users where auth_id = $1', [req.query.auth_id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        if (result.rows.length === 0) {
            res.status(403).json({ result: 'user needs to be signed in' });
            return;
        }
        user_name = result.rows[0].user_name;
        user_id = result.rows[0].user_id;
        pool.query('insert into question (user_id, questions) values ($1, $2) returning *', [user_id, req.body.questions], (error, result) => {
            if (error) {
                res.status(500).json({ error: error.message });
                result;
            }
            res.status(201).json({ user_id: user_id, username: user_name, question_id: result.rows[0].question_id, question: result.rows[0].questions });
        });
    });
});
app.get('/questions', (req, res) => {
    const pool = openDb();
    pool.query('select u.user_name, q.question_id, q.questions, q.created_at from question q join users u on q.user_id = u.user_id', (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.status(200).json(result.rows);
    });
});
app.get('/questions/:query_id', (req, res) => {
    const pool = openDb();
    pool.query('select u.user_name, q.question_id, q.questions, q.created_at from question q join users u on q.user_id = u.user_id where q.question_id = $1', [req.params.query_id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
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
            return;
        }
        if (result.rows.length === 0) {
            res.status(403).json({ result: 'forbidden' });
            return;
        }
        user_id = result.rows[0].user_id;
        pool.query('insert into comments (question_id, comment, user_id) values ($1, $2, $3) returning *', [req.body.question_id, req.body.comment, user_id], (error, result) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.status(201).json(result.rows);
        });
    });
});
app.delete('/question/:query_id', (req, res) => {
    const pool = openDb();
    pool.query('select * from users u join question q on u.user_id = q.user_id where u.auth_id = $1 and q.question_id = $2', [req.query.auth_id, req.params.query_id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        if (result.rows.length === 0) {
            res.status(403).json({ error: 'forbidden' });
            return;
        }
        pool.query('delete from question where question_id = $1', [req.params.query_id], (error) => {
            if (error) {
                res.status(500).json({ error: error.message });
            }
        });
        res.status(200).json({ status: "success" });
    });
});
const openDb = () => {
    const pool = new pg_1.Pool({
        user: 'root',
        host: 'dpg-cl7pr4f6e7vc739vf5sg-a.oregon-postgres.render.com',
        database: 'studyhub_jbtk',
        password: 'TnvMD1k7RCfUBC26FUc7PgkkmzXah8Qj',
        port: 5432,
        ssl: true
    });
    return pool;
};
app.listen(port);
