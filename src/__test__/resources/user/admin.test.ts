describe("CRUD TO ADMIN RESOURCE", () => {
  // CREATE
  test(
    "When an authenticated admin accesses POST /api/v1/resources/users/admins " +
      'with name "Test Admin Created" and password "123", ' +
      "then it should create a new User and a new Admin resource in the database",
    async () => {
      return expect(false).toBeTruthy();
    }
  );

  // UPDATE
  test(
    "When an authenticated admin accesses PUT /api/v1/resources/users/admins/:id " +
      'with name "Test Admin Edited", ' +
      "then it should update the User with the new provided information",
    async () => {
      return expect(false).toBeTruthy();
    }
  );

  // GET
  test(
    "When an authenticated admin accesses GET /api/v1/resources/users/admins/:id " +
      "with the ID of the first admin, " +
      "then it should return the first admin and associated user created",
    async () => {
      return expect(false).toBeTruthy();
    }
  );

  // LIST
  test(
    "When an authenticated admin accesses GET /api/v1/resources/users/admins " +
      "then it should return an array containing the first admin created",
    async () => {
      return expect(false).toBeTruthy();
    }
  );

  // DELETE
  test(
    "When an authenticated admin accesses DELETE /api/v1/resources/users/admins/:id " +
      "then it should return a 204 status and delete the first admin created",
    async () => {
      return expect(false).toBeTruthy();
    }
  );
});
