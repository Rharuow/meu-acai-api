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
            - [ ] A client should update their data.
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
            - [ ] In the test description, utilize variables for routers and parameters.
            - [ ] Separate the CRUD routes into different descriptions.
          - **IMPROVEMENTS:**
            - [x] Test to CREATE Cream
            - [x] Test for failed cases in CREATE a Cream
            - [x] Test to UPDATE Cream
            - [x] Test for failed cases in UPDATE a Cream
            - [x] Test to GET Cream
            - [x] Test for failed cases in GET a Cream
            - [ ] Test to LIST Cream
            - [ ] Test for failed cases in LIST a Cream
            - [x] Test to DELETE Cream
            - [x] Test for failed cases in DELETE a Cream
            - [x] Test for DELETE MANY Cream
            - [x] Test for failed cases in DELETE MANY a Cream

- **FEATS:**
  - **Routes:**
    - **Resources:**
      - **User:**
        - **ADMIN**
          - **REFACTOR:**
            - [ ] Add email and phone as optional fields in the Admin Model Schema.
          - **IMPROVEMENTS:**
            - [x] Admin Model in Schema
            - [x] Router to create ADMIN
            - [x] Router to update ADMIN
            - [x] Router to get ADMIN
            - [x] Router to list with pagination and filters ADMIN
            - [x] Router to delete many ADMIN
        - **CLIENT**
          - **IMPROVEMENTS:**
            - [x] Client Model in Schema
            - [x] Router to create Client
            - [x] Router to update Client
            - [x] Router to get Client
            - [x] Router to list with pagination and filters Client
            - [x] Router to delete Client
            - [x] Router to delete many Client
        - **MEMBER**
          - **IMPROVEMENTS:**
            - [x] Member Model in Schema
            - [x] Router to create Member
            - [x] Router to update Member
            - [x] Router to get Member
            - [x] Router to list with pagination and filters Member
            - [ ] Router to delete many Member
      - **CREAM:**
        - **IMPROVEMENTS:**
          - [x] Cream Model in Schema
          - [x] Router to create Cream
          - [x] Router to update Cream
          - [x] Router to get Cream
          - [x] Router to list with pagination and filters Cream
          - [x] Router to delete Cream
