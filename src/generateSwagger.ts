import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs-extra";
import { swaggerDef } from "./swaggerDef";

export const OUTPUTPATH = "./src/swagger-spec.json";

export const saveSwaggerDefinitions = async (definition = {}) => {
  const swaggerSpec = swaggerJSDoc({
    ...swaggerDef,
    definition: {
      ...swaggerDef.definition,
      ...definition,
    },
  });
  try {
    await fs.outputJson(OUTPUTPATH, swaggerSpec, { spaces: 2 });
    console.log(`Swagger specification saved to ${OUTPUTPATH}`);
  } catch (error) {
    console.error("Error writing Swagger specification:", error);
  }
};

saveSwaggerDefinitions();
