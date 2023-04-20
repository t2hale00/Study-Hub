import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { Pool } from 'pg'
import { QueryResult } from 'pg'

const app: Express = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

const port = 3001

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

app.listen(port)