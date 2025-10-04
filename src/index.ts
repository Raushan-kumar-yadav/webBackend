import express ,{json} from 'express';
import ProductRouter from './routes/products/index.js';
import AuthRouter from './routes/auth/index.js';
import uploadRouter from './routes/uploadRoute/index.js';



const port = 3000;

const app = express();

app.use(json());

app.use('/api/products', ProductRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/upload', uploadRouter);

app.listen(port,() =>{
    console.log(`Listening to port: ${port}`);
}) 