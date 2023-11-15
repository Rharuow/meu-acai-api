export const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "List and handle API SpaceX.",
    description:
      "In this project, the SpaceX API (https://github.com/r-spacex/SpaceX-API) provides info about rocket's launches made by company. When the server is started, a script get this informations and save at mongoDB handled for this project. Furtermore, a CRON call a funcation at 9:00 am, every day, to get the latest launch, and update at mongoDB. In this project there'r four routes, list launches with pagination and search by name rocket, home that's just apresentation, stats to pice graphic and stats to vertical bar graphic.",
    contact: {
      phone: "+55(84)981758502",
      email: "haryssonsoares@gmail.com",
    },
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "If you run this project locally",
    },
    {
      url: "https://coodesh-test-spacex-api.onrender.com",
      description: "To access routes in production",
    },
  ],
};
