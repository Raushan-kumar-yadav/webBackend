import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'postgresql', 
  schema: ['./src/db/productSchema.ts','./src/db/userSchema.ts'],
  out: './src/db/drizzle',
  dbCredentials:{
    url: process.env.DATABASE_URL!,
  },
  verbose:true,
  strict:true
})
