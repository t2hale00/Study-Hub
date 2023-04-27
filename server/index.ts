import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { Pool } from 'pg'
import { QueryResult } from 'pg'
//this is to parse request body for POST requests
const app: Express = express();
const { createToken } = require('./auth');
const path = require("path");
const knex = require ('knex');
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
    extended: true
    })
);
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

const port = 3001

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




app.get("/profile", (req,res) => {
    res.send ("Hello profile!");
});


app.delete("/delete/:id",async(req: Request,res: Response) => {
    const pool = openDb()

    const id = parseInt(req.params.id)

    pool.query('delete from feedback where id = $1',
    [id],
    (error: Error,result: QueryResult) => {
        if(error) {
            res.status(500).json({error: error.message})
        }

        res.status(200).json({id: id})
    })
})


app.post('/new',(req: Request, res: Response) => {
    const pool = openDb()

    pool.query('insert into feedback (description) values ($1) returning *',
    [req.body.description],
    (error: Error,result: QueryResult) => {
        if (error) {
            res.status(500).json({error: error.message})
        }
        res.status(200).json({id: result.rows[0].id})
    })
})

app.get('/', (req: Request, res: Response) => {
    //res.status(200).json({result: 'success'})
    const pool = openDb()

    pool.query('select * from feedback', (error, result) => {
      if (error) {
        res.status(500).json({error: error.message})
        }
        res.status(200).json(result.rows)
    })
})

const openDb = (): Pool => {
    const pool: Pool = new Pool ({  
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
    })  
    return pool
}
const db = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: '1805',
        database: 'studyhub'
    }
})

app.listen(port)