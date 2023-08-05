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
    if (req.body.password != req.body.confirm_password) {
        res.status(400).json({error: 'confirm password'}) 
        return
    }
    pool.query('insert into users (first_name, last_name, user_name, email, password, sex) values ($1, $2, $3, $4, $5, $6) returning *', 
    [req.body.first_name, req.body.last_name, req.body.user_name, req.body.email, req.body.password, req.body.sex], 
    (error: Error, result: QueryResult) => {
        if (error) {
            res.status(500).json({error:error.message})
            return
        }

        res.status(201).json({name: result.rows[0].user_name})  
    })
})

app.post('/login', (req:Request,res:Response) => {
    const pool = openDb()

    pool.query('select * from users where email = $1 and password = $2',
    [req.body.email, req.body.pwdhash], 
    (error: Error, result: QueryResult) => {
        if (error) {
            res.status(500).json({error:error.message})
            return
        }
        if (result.rows.length === 0) {
            res.status(403).json({result: 'forbidden'}) 
            return
        }

        if (result.rows.length >= 2) {
            res.status(403).json({result: 'contact admin'}) 
            return
        }

        let auth = uuidv4();
        pool.query('UPDATE users SET auth_id = $1 WHERE email = $2 returning *', 
        [auth, req.body.email], 
        (error: Error, result: QueryResult) => {
            if (error) {
                res.status(500).json({error:error.message})
                return
            }

            res.status(200).json(result.rows)  
        })
    })
})

app.post('/delete_user', (req:Request,res:Response) => {
    const pool = openDb()

    pool.query('delete from user where user_name = $1',
    [req.query.auth_id], 
    (error: Error, result: QueryResult) => {
        if (error) {
            res.status(500).json({error:error.message})
            return
        }

        res.status(200).json(result.rows) 
    })
})

app.post('/questions', (req:Request,res:Response) => {
    const pool = openDb()
    let user_name = ""
    let user_id = ""
   
   pool.query('select * from users where auth_id = $1',
   [req.query.auth_id], 
   (error: Error, result: QueryResult) => {
       if (error) {
           res.status(500).json({error:error.message})
           return
       }
       if (result.rows.length === 0) {
           res.status(403).json({result: 'user needs to be signed in'}) 
           return
       }     
       user_name = result.rows[0].user_name
       user_id = result.rows[0].user_id

       pool.query('insert into question (user_id, questions) values ($1, $2) returning *', 
        [user_id, req.body.questions], 
        (error: Error, result: QueryResult) => {
                if (error) {
                    res.status(500).json({error:error.message})
                    result
                }

            res.status(201).json({user_id: user_id, username: user_name, question: result.rows[0].questions})  
        })
   })
})

app.get('/questions', (req:Request,res:Response) => {
    const pool = openDb()
   
    pool.query('select u.user_name, q.question_id, q.questions, q.created_at from question q join users u on q.user_id = u.user_id',
    (error: Error, result: QueryResult) => {
        if (error) {
            res.status(500).json({error:error.message})
            return
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
           return
       }
       if (result.rows.length === 0) {
           res.status(403).json({result: 'forbidden'}) 
           return
       }

       user_id = result.rows[0].user_id

        pool.query('insert into comments (question_id, comment, user_id) values ($1, $2, $3) returning *', 
        [req.body.question_id, req.body.comment, user_id], 
        (error: Error, result: QueryResult) => {
                if (error) {
                    res.status(500).json({error:error.message})
                    return
                }

                res.status(201).json(result.rows) 
        })
   })
})


app.delete('/question/:query_id', (req:Request,res:Response) => {
    const pool = openDb()
   
    pool.query('select * from users u join question q on u.user_id = q.user_id where u.auth_id = $1 and q.question_id = $2',
   [req.query.auth_id, req.params.query_id], 
   (error: Error, result: QueryResult) => {
       if (error) {
           res.status(500).json({error:error.message})
           return
       }
       if (result.rows.length === 0) {
           res.status(403).json({error: 'forbidden'}) 
           return
       }

       pool.query('delete from question where question_id = $1', 
        [req.params.query_id], 
        (error: Error) => {
                if (error) {
                    res.status(500).json({error:error.message})
                }
            }) 
        res.status(200).json({status: "success"}) 
   })
})

const openDb = (): Pool => {
    const pool: Pool = new Pool ({  
        user: 'root',
        host: 'dpg-cikpjgp5rnuvtgr0h9a0-a.oregon-postgres.render.com',
        database: 'studyhub',
        password: 'i9sAdXFHMdupsQot4YaTmqQ3MvTNa2xu',
        port: 5432,
        ssl: true
    })  
    return pool
}

app.listen(port)