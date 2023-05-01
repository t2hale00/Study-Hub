import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { Pool } from 'pg'
import { QueryResult } from 'pg'
import { error } from 'console';
import {v4 as uuidv4} from 'uuid';

//this is to parse request body for POST requests
const app: Express = express();

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

const port = 3002

app.post('/register', (req:Request,res:Response) => {
    const pool = openDb()
    pool.query('insert into users (name, email, pwdhash) values ($1, $2, $3) returning *', 
    [req.body.name, req.body.email, req.body.pwdhash], 
    (error: Error, result: QueryResult) => {
        if (error) {
            res.status(500).json({error:error.message})
        }

        res.status(201).json({name: result.rows[0].name})  
    })
})

app.post('/login', (req:Request,res:Response) => {
    const pool = openDb()

    pool.query('select * from users where email = $1 and pwdhash = $2',
    [req.body.email, req.body.pwdhash], 
    (error: Error, result: QueryResult) => {
        if (error) {
            res.status(500).json({error:error.message})
        }
        if (result.rows.length === 0) {
            res.status(403).json({result: 'forbidden'}) 
        }
    })

    let auth = uuidv4();
    pool.query('UPDATE users SET auth_id = $1 WHERE email = $2 returning *', 
    [auth, req.body.email], 
    (error: Error, result: QueryResult) => {
        if (error) {
            res.status(500).json({error:error.message})
        }

       res.status(200).json({email: result.rows[0].email, auth: result.rows[0].auth_id})  
    })

})

app.post('/questions', (req:Request,res:Response) => {
    const pool = openDb()
    let user_name = ""
   
   pool.query('select * from users where auth_id = $1 and user_id = $2',
   [req.query.auth_id, req.body.user_id], 
   (error: Error, result: QueryResult) => {
       if (error) {
           res.status(500).json({error:error.message})
       }
       if (result.rows.length === 0) {
           res.status(403).json({result: 'forbidden'}) 
       }

       user_name = result.rows[0].name
   })
   
   
   pool.query('insert into question (user_id, questions) values ($1, $2) returning *', 
   [req.body.user_id, req.body.questions], 
   (error: Error, result: QueryResult) => {
    if (error) {
        res.status(500).json({error:error.message})
    }

    res.status(201).json({name: user_name, question: result.rows[0].questions})  
})
})

app.get('/questions', (req:Request,res:Response) => {
    const pool = openDb()
   
   pool.query('select u.name, q.question_id, q.questions, q.created_at from question q join users u on q.user_id = u.user_id',
   (error: Error, result: QueryResult) => {
       if (error) {
           res.status(500).json({error:error.message})
       }
        res.status(200).json(result.rows) 
   })

   
})

app.post('/addcomment', (req:Request,res:Response) => {
    const pool = openDb()
    let user_id
   
   pool.query('select * from users where auth_id = $1',
   [req.query.auth_id], 
   (error: Error, result: QueryResult) => {
       if (error) {
           res.status(500).json({error:error.message})
       }
       if (result.rows.length === 0) {
           res.status(403).json({result: 'forbidden'}) 
       }

       user_id = result.rows[0].user_id
   })

   pool.query('insert into comments (question_id, comment, user_id) values ($1, $2, $3) returning *', 
   [req.body.question_id, req.body.comment, req.body.user_id], 
   (error: Error, result: QueryResult) => {
        if (error) {
            res.status(500).json({error:error.message})
        }

    res.status(201).json(result.rows) 
    })
})

app.post('/addcomment', (req:Request,res:Response) => {
    const pool = openDb()
    let user_id
   
   pool.query('select * from users where auth_id = $1',
   [req.query.auth_id], 
   (error: Error, result: QueryResult) => {
       if (error) {
           res.status(500).json({error:error.message})
       }
       if (result.rows.length === 0) {
           res.status(403).json({result: 'forbidden'}) 
       }

       user_id = result.rows[0].user_id
   })

   pool.query('insert into comments (question_id, comment, user_id) values ($1, $2, $3) returning *', 
   [req.body.question_id, req.body.comment, req.body.user_id], 
   (error: Error, result: QueryResult) => {
        if (error) {
            res.status(500).json({error:error.message})
        }

    res.status(201).json(result.rows) 
    })
})

app.delete('/question/:query_id', (req:Request,res:Response) => {
    const pool = openDb()
   
    pool.query('select * from users u join question q on u.user_id = q.user_id where u.auth_id = $1 and q.question_id = $2',
   [req.query.auth_id, req.params.query_id], 
   (error: Error, result: QueryResult) => {
       if (error) {
           res.status(500).json({error:error.message})
       }
       if (result.rows.length === 0) {
           res.status(403).json({error: 'forbidden'}) 
       }
   })

   pool.query('delete from question where question_id = $1', 
   [req.params.query_id], 
   (error: Error) => {
        if (error) {
            res.status(500).json({error:error.message})
        }
    }) 
    res.status(200).json({status: "success"}) 
})

const openDb = (): Pool => {
    const pool: Pool = new Pool ({  
        user: 'postgres',
        host: 'localhost',
        database: 'studyhub',
        password: '1234',
        port: 5432,
    })  
    return pool
}

app.listen(port)