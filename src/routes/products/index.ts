import {Router} from 'express';
import {listProduct,getProductById,createProduct,updateProduct,deleteProduct,getProductPriceByID} from "./productController.js"
import { createInsertSchema, } from 'drizzle-zod';
import { ProductTable } from '../../db/productSchema.js';
//import { z } from 'zod';
import { validateData } from '../../middleWare/validationDataMidware.js';
import { verifyToken } from '../../middleWare/authMidware.js';


const createProductSchema = createInsertSchema(ProductTable);
const updateProductSchema = createInsertSchema(ProductTable);


const router = Router()

// Get all product list
router.get('/',listProduct);

// Get Product by its id
router.get('/:id',getProductById);


// Create Products
router.post('/', verifyToken,validateData(createProductSchema) ,createProduct);


// Update product
router.put('/:id',verifyToken,validateData(updateProductSchema),updateProduct);

// Delete product by its id 
router.delete('/:id',verifyToken, deleteProduct);


// Get product pricing details by product id  
router.get('/:id/pricing', getProductPriceByID);

//Upload product image and video method

router.post('/:id/upload', verifyToken, (req, res) => {
    // Handle file upload logic here
    res.send(`Upload endpoint for product ID: ${req.params.id}`);
});



export default router;