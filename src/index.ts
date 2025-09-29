import express ,{json} from 'express';
import ProductRouter from './routes/products/index.ts';
import AuthRouter from './routes/auth/index.ts';
import uploadRouter from './routes/uploadRoute/index.ts';



const port = 3000;

const app = express();

app.use(json());

app.use('/api/products', ProductRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/upload', uploadRouter);

app.listen(port,() =>{
    console.log(`Listening to port: ${port}`);
}) 