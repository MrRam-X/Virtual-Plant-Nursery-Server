import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 6000

app.use(express.json())
app.use(cors());
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
