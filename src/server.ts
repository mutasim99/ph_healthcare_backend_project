import "dotenv/config"

import app from "./app";

const port = 3000;

const bootstrap = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};
bootstrap();
