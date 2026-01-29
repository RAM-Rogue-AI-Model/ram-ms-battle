import express from 'express';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3002;

app.get('/', (req, res) => {
  res.send('Hello Battle!');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`);
});
