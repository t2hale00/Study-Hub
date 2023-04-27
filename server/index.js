"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
//this is to parse request body for POST requests
const app = (0, express_1.default)();
const { createToken } = require('./auth');
const path = require("path");
const knex = require('knex');
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const port = 3001;
/*let initialPath = path.join(__dirname, "public");

app.use(express.static(initialPath));

app.get('/', (req, res)=> {
    res.sendFile(path.join(initialPath, "index.html"));
})

app.get("/login", (req,res) => {
    res.sendFile (path.join(initialPath, "login.html"));
});

app.get("/register", (req,res) => {
    res.sendFile (path.join(initialPath, "signup.html"));
});



app.listen (3000,() => {
    console.log ("Example app listening on port 3000!");
});
*/
app.post("/login", (req, res) => {
    // Read username and password from request body
    const { username, password } = req.body;
    // Console log that somebody is trying to log in
    console.log(`Trying to log in with username: ${username} and password: ${password}`);
    // Check if username and password are valid
    if (username === "john@gmail.com" && password === "password") {
        // Create a JWT token
        const token = createToken(username);
        // Login successful
        return res.json({ message: "Login successful!", token: token });
    }
    // Login failed
    return res.status(401).send("Login failed!");
});
app.get("/profile", (req, res) => {
    res.send("Hello profile!");
});
app.delete("/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = openDb();
    const id = parseInt(req.params.id);
    pool.query('delete from feedback where id = $1', [id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.status(200).json({ id: id });
    });
}));
app.post('/new', (req, res) => {
    const pool = openDb();
    pool.query('insert into feedback (description) values ($1) returning *', [req.body.description], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.status(200).json({ id: result.rows[0].id });
    });
});
app.get('/', (req, res) => {
    //res.status(200).json({result: 'success'})
    const pool = openDb();
    pool.query('select * from feedback', (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.status(200).json(result.rows);
    });
});
const openDb = () => {
    const pool = new pg_1.Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'feedback',
        password: '1805',
        port: 5432,
        /*user: 'root',
        host: 'dpg-ch0fft33cv2c5b40uldg-a.oregon-postgres.render.com',
        database: 'feedback_3srd',
        password: '6ZpVgBgPxITJ4Ik8AtjSiXqulEHAPAkK',
        port: 5432,
        ssl: true
*/
    });
    return pool;
};
const db = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: '1805',
        database: 'studyhub'
    }
});
app.listen(port);
