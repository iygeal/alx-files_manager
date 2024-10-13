import express from 'express';
import routes from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Load all routes from routes/index.js
app.use(routes);

// Statrt the express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
