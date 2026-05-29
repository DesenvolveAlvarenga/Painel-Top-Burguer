// import { app, config } from './app';

// const port = config.port;

// app.listen(port, () => {
//   console.log(`Backend executando em http://localhost:${port}`);
// });




// src/server.ts
import { app, config } from './app'; // Importando de ./app.ts

const port = config.port;

app.listen(port, () => {
  console.log(`Backend executando em http://localhost:${port}`);
});