import express, { response } from 'express'
import routes from './routes'
import cors from 'cors'
import path from 'path'
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));


const users = ['robson ', 'carlos,joshons', 'xesques', 'joshons msm'];




app.listen(3333);