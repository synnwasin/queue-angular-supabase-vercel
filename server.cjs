const app = require('./api/index.js');

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`Express API running at http://localhost:${PORT}`);
});