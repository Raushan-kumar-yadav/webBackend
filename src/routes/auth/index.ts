import { Router } from 'express';
import { createUserSchema, usersTable, loginUserSchema } from '../../db/userSchema.ts';
import { validateData } from '../../middleWare/validationDataMidware.ts';
import bcrypt from 'bcrypt';
import { db } from '../../db/index.ts';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', validateData(createUserSchema), async (req, res) => {
    try {
        const data = req.cleanBody;
        
       
        data.password = await bcrypt.hash(data.password, 10);
        
        // Save user to database
        const [user] = await db.insert(usersTable).values(data).returning();
        
        
        const { password, ...userWithoutPassword } = user;
        
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Registration failed" });
    }
});

router.post('/login', validateData(loginUserSchema), async (req, res) => {
    try {
        const { email, password } = req.cleanBody;
        
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
        
        if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        
        
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
        
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            jwtSecret,
            { expiresIn: '2d' }
        );
        
       
        const { password: _, ...userWithoutPassword } = user;
        
        res.status(200).json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Login failed" });
    }
});

export default router;
