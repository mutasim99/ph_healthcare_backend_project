import "dotenv/config";

import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";

const port = envVars.PORT || 3000;

const bootstrap = async () => {
  try {
    await seedSuperAdmin()
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};
bootstrap();
