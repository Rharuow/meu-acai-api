# Meu Açai API

Meu Açai API is a robust RESTful backend designed to power two distinct front-end applications: a customer app and an admin app, both centered around the delightful world of "Meu Açai." This project not only serves the purpose of providing data to the front-end interfaces but also showcases the developer's expertise in backend development using NodeJS and Express.

## Clone, Install And Run

To get started with the Meu Açai API, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Rharuow/meu-acai-api.git

   ```

1. **Navigate to the project directory:**

   ```bash
   cd meu-acai-api

   ```

1. **Install the project dependencies:**

   ```bash
   npm install

   ```

1. **You're now ready to run the project! Use the appropriate command to start the serve:**

   ```bash
    # For development
    npm run dev

    # For production

    npm run start

    # For test

    npm run test

    # For build

    npm run build
   ```

## Features

- **Seamless Integration:**
  - Ensures smooth integration with the Meu Açai customer and admin apps.
- **Performance and Scalability:**

  - Utilizes NodeJS and Express to deliver a high-performance and scalable backend.

- **Authentication and CRUD Operations:**

  - Implements secure authentication for the customer app.
  - Develops comprehensive CRUD operations for the admin app.

- **Automated Tests with Jest:**
  - Showcases proficiency in creating unit tests using Jest.
- **Thorough Testing:**

  - Rigorous testing of API endpoints to ensure functionality and stability.

- **Documentation:**
  - Well-documented project with comprehensive information on API routes and usage in this README.

## To-Do List

- **Docs**

  - Wellcome
    - [x] Get
  - AUTHENTICATION
    - [x] Create signIn
  - CREAM
    - [x] Create
    - [x] Update
    - [x] List
    - [x] Get
    - [x] Delete
    - [x] Delete Many

- **TESTS:**

  - **Routes:**

    - **Resources:**

      - **User:**

        - **ADMIN**

          - **REFACTOR:**
            - [x] In the test description, use variables for routers and parameters.
            - [x] Separate the CRUD routes into different descriptions.
          - **IMPROVEMENTS:**
            - [x] Test to CREATE Admin
            - [x] Test for failed cases in CREATE an Admin
            - [x] Test to UPDATE Admin
            - [x] Test for failed cases in UPDATE an Admin
            - [x] Test to GET Admin
            - [x] Test for failed cases in GET an Admin
            - [x] Test to LIST Admin
            - [x] Test for failed cases in LIST an Admin
            - [x] Test to DELETE Admin
            - [x] Test for failed cases in DELETE an Admin
            - [x] Test for DELETE MANY Admin
            - [x] Test for failed cases in DELETE MANY an Admin

        - **CLIENT**

          - **REFACTOR:**
            - [x] In the test description, utilize variables for routers and parameters.
            - [x] Separate the CRUD routes into different descriptions.
            - [x] The client can update their own data.
            - [x] The client can get their own data.
          - **IMPROVEMENTS:**
            - [x] Test to CREATE Client
            - [x] Test for failed cases in CREATE a Client
            - [x] Test to UPDATE Client
            - [x] Test for failed cases in UPDATE a Client
            - [x] Test to GET Client
            - [x] Test for failed cases in GET a Client
            - [x] Test to LIST Client
            - [x] Test for failed cases in LIST a Client
            - [x] Test to DELETE Client
            - [x] Test for failed cases in DELETE a Client
            - [x] Test for DELETE MANY Client
            - [x] Test for failed cases in DELETE MANY a Client

        - **MEMBER**

          - **REFACTOR:**
            - [x] In the test description, utilize variables for routers and parameters.
            - [x] Separate the CRUD routes into different descriptions.
            - [x] A member should update their own data.
            - [x] A member should get their own data.
          - **IMPROVEMENTS:**
            - [x] Test to CREATE Client
            - [x] Test for failed cases in CREATE a Client
            - [x] Test to UPDATE Client
            - [x] Test for failed cases in UPDATE a Client
            - [x] Test to GET Client
            - [x] Test for failed cases in GET a Client
            - [x] Test to LIST Client
            - [x] Test for failed cases in LIST a Client
            - [x] Test to DELETE Client
            - [x] Test for failed cases in DELETE a Client
            - [x] Test for DELETE MANY Client
            - [x] Test for failed cases in DELETE MANY a Client

      - **CREAM**

        - **REFACTOR:**
          - [x] In the test description, use variables for routers and parameters.
          - [x] Separate the CRUD routes into different descriptions.
        - **IMPROVEMENTS:**
          - [x] Test to CREATE Cream
          - [x] Test for failed cases in CREATE a Cream
          - [x] Test to UPDATE Cream
          - [x] Test for failed cases in UPDATE a Cream
          - [x] Test to GET Cream
          - [x] Test for failed cases in GET a Cream
          - [x] Test to LIST Cream
          - [x] Test for failed cases in LIST a Cream
          - [x] Test to DELETE Cream
          - [x] Test for failed cases in DELETE a Cream
          - [x] Test for DELETE MANY Cream
          - [x] Test for failed cases in DELETE MANY a Cream

      - **TOPPING**

        - **IMPROVEMENTS:**
          - [x] Test to CREATE Topping
          - [x] Test for failed cases in CREATE a Topping
          - [x] Test to UPDATE Topping
          - [x] Test for failed cases in UPDATE a Topping
          - [x] Test to GET Topping
          - [x] Test for failed cases in GET a Topping
          - [x] Test to LIST Toppings
          - [x] Test for failed cases in LIST a Toppings
          - [x] Test to DELETE Topping
          - [x] Test for failed cases in DELETE a Topping
          - [x] Test for DELETE MANY Toppings
          - [x] Test for failed cases in DELETE MANY a Toppings

      - **PRODUCT**
        - **IMPROVEMENTS:**
          - [x] Test to CREATE Product
          - [x] Test for failed cases in CREATE a Product
          - [x] Test to UPDATE Product
          - [x] Test for failed cases in UPDATE a Product
          - [x] Test to GET Product
          - [x] Test for failed cases in GET a Product
          - [x] Test to LIST Products
          - [x] Test for failed cases in LIST a Products
          - [x] Test to DELETE Product
          - [x] Test for failed cases in DELETE a Product
          - [x] Test for DELETE MANY Products
          - [x] Test for failed cases in DELETE MANY a Products

- **FEATS:**

  - **Routes:**

    - **Resources:**

      - **USER:**

        - **ADMIN**
          - **IMPROVEMENTS:**
            - [x] Add email and phone as optional fields in the Admin Model Schema.
            - [x] Admin Model in Schema
            - [x] Router to create ADMIN ( POST /api/v1/resources/users/admins )
                  {
                  name: string;
                  password: string;
                  email?: string;
                  phone?: string
                  }
            - [x] Router to update ADMIN ( PUT /api/v1/resources/users/admins/:id )
                  {
                  name?: stirng;
                  password?: string;
                  email?: string;
                  phone?: string
                  }
            - [x] Router to get ADMIN ( GET /api/v1/resources/users/admins/:id )
            - [x] Router to list with pagination and filters ADMIN ( GET /api/v1/resources/users/admins)
            - [x] Router to delete ADMIN ( DELETE /api/v1/resources/users/:id )
            - [x] Router to delete many ADMIN ( DELETE /api/v1/resources/users/admins/deleteMany?ids=id1&id2)
        - **CLIENT**
          - **REFACTOR**
            - [x] The client should only delete their own account.
          - **IMPROVEMENTS:**
            - [x] CLIENT Model in Schema
            - [x] Router to swap Client and Member entities (constrain PERMITION ADMIN )
            - [x] Router to change address
            - [x] Router to create CLIENT ( POST "/api/v1/resources/users/clients" )
                  {
                  name: string;
                  password: string;
                  email?: string;
                  phone?: string
                  }
            - [x] Router to update CLIENT ( PUT "/api/v1/resources/users/clients/:id" )
                  {
                  name?: string;
                  password?: string;
                  email?: string;
                  phone?: string
                  }
            - [x] Router to get CLIENT ( GET /api/v1/resources/users/clients/:id )
            - [x] Router to list with pagination and filters CLIENT ( GET /api/v1/resources/users/clients)
            - [x] Router to delete CLIENT ( DELETE /api/v1/resources/users/:id )
            - [x] Router to delete CLIENT own account ( DELETE /api/v1/resources/users/clients/:userId)
            - [x] Router to delete many CLIENT ( DELETE /api/v1/resources/users/clients/deleteMany?ids=id1&id2)
        - **MEMBER**
          - **REFACTOR**
            - [x] The member should only delete their own account.
          - **IMPROVEMENTS:**
            - [x] Member Model in Schema
            - [x] Router to create Member ( POST "/api/v1/resources/users/members" )
                  {
                  name: string;
                  password: string;
                  email?: string;
                  phone?: string
                  }
            - [x] Router to update Member ( PUT "/api/v1/resources/users/members/:id" )
                  {
                  name?: string;
                  password?: string;
                  email?: string;
                  phone?: string
                  }
            - [x] Router to get Member ( GET "/api/v1/resources/users/members/:id" )
            - [x] Router to list with pagination and filters Member ( GET "/api/v1/resources/users/members/" )
            - [x] Router to delete many Member ( DELETE "/api/v1/resources/users/members/deleteMany?ids=id1&id2" )

      - **CREAM:**

        - **IMPROVEMENTS:**
          - [x] Cream Model in Schema
          - [x] Router to create Cream ( POST "/api/v1/resources/creams" )
                {
                name: string,
                price: float,
                amount: number,
                unit: string
                }
          - [x] Router to update Cream ( PUT "/api/v1/resources/creams/:id" )
                {
                name?: string,
                price?: float,
                amount?: number,
                unit?: string
                }
          - [x] Router to get Cream ( GET "/api/v1/resources/creams/:id" )
          - [x] Router to list with pagination and filters Cream ( GET "/api/v1/resources/creams" )
          - [x] Router to delete Cream ( DELETE "/api/v1/resources/creams/:id" )
          - [x] Router to delete many Cream ( DELETE "/api/v1/resources/creams/delteMany?ids=id1&id2" )

      - **TOPPING**

        - **IMPROVEMENTS:**
          - [x] Topping Model in Schema
          - [x] Router to create Topping ( POST "/api/v1/resources/toppings" )
                {
                name: string,
                price: float,
                amount: number,
                unit?: string,
                isSpecial?: boolean,
                available?: boolean,
                photo?: string,
                }
          - [x] Router to update Topping ( PUT "/api/v1/resources/toppings/:id" )
                {
                name?: string,
                price?: float,
                amount?: number,
                unit?: string,
                isSpecial?: boolean,
                available?: boolean,
                photo?: string,
                }
          - [x] Router to get Topping ( GET "/api/v1/resources/toppings/:id" )
          - [x] Router to list with pagination and filters Topping ( GET "/api/v1/resources/toppings" )
          - [x] Router to delete Topping ( DELETE "/api/v1/resources/toppings/:id" )
          - [x] Router to delete many Topping ( DELETE "/api/v1/resources/toppings/delteMany?ids=id1&id2" )

      - **PRODUCT**
        - **IMPROVEMENTS:**
          - [x] Product Model in Schema
          - [x] Router to create Product ( POST "/api/v1/resources/products" )
                {
                name?: string,
                price: float,
                size: string,
                maxCreamsAllowed: number,
                maxToppingsAllowed: number,
                available?: boolean,
                photo?: string,
                }
          - [x] Router to update Product ( PUT "/api/v1/resources/products/:id" )
                {
                name?: string,
                price: float,
                size: string,
                maxCreamsAllowed: number,
                maxToppingsAllowed: number,
                available?: boolean,
                photo?: string,
                }
          - [x] Router to get Product ( GET "/api/v1/resources/products/:id" )
          - [x] Router to list with pagination and filters Product ( GET "/api/v1/resources/products" )
          - [x] Router to delete Product ( DELETE "/api/v1/resources/products/:id" )
          - [x] Router to delete many Product ( DELETE "/api/v1/resources/products/delteMany?ids=id1&id2" )
