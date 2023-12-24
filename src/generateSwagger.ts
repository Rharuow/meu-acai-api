import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs-extra";
import { swaggerDef } from "./swaggerDef";

const swaggerSpec = swaggerJSDoc(swaggerDef);

const outputPath = "./src/swagger-spec.json";

fs.outputJson(outputPath, swaggerSpec, { spaces: 2 })
  .then(() => console.log(`Swagger specification saved to ${outputPath}`))
  .catch((err) => console.error("Error writing Swagger specification:", err));
