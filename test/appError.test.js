const AppError = require("../utils/appError")

describe("AppError", () => {

  describe("statusCode", () => {
    it("sets statusCode correctly for 404", () => {
      const err = new AppError("Not found", 404);
      expect(err.statusCode).toBe(404);
    });

    it("sets statusCode correctly for 500", () => {
      const err = new AppError("Server error", 500);
      expect(err.statusCode).toBe(500);
    });
  });

  describe("status field", () => {
    it("is fail for 400", () => {
      expect(new AppError("bad", 400).status).toBe("fail");
    });
    it("is fail for 401", () => {
      expect(new AppError("unauth", 401).status).toBe("fail");
    });
    it("is fail for 403", () => {
      expect(new AppError("forbidden", 403).status).toBe("fail");
    });
    it("is fail for 404", () => {
      expect(new AppError("not found", 404).status).toBe("fail");
    });
    it("is error for 500", () => {
      expect(new AppError("server", 500).status).toBe("error");
    });
  });

  describe("isOperational", () => {
    it("is always true", () => {
      expect(new AppError("msg", 400).isOperational).toBe(true);
      expect(new AppError("msg", 500).isOperational).toBe(true);
    });
  });

  describe("instanceof", () => {
    it("is an instance of Error", () => {
      const err = new AppError("msg", 400);
      expect(err).toBeInstanceOf(Error);
    });
  });

})

