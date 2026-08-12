
const asyncHandler = require("../utils/asyncHandler");

describe("asyncHandler", () => {

  it("calls the async function with req, res, next", async () => {
    const mockReq  = {};
    const mockRes  = {};
    const mockNext = jest.fn();

    const mockFn = jest.fn().mockResolvedValue("ok");
    const wrapped = asyncHandler(mockFn);

    await wrapped(mockReq, mockRes, mockNext);

    expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });

  it("calls next(err) when the async function throws", async () => {
    const mockReq  = {};
    const mockRes  = {};
    const mockNext = jest.fn();
    const error    = new Error("Something went wrong");

    const mockFn = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(mockFn);

    await wrapped(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

});