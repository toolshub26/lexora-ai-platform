import { userService } from "@/features/user/service";

describe("UserService", () => {
  it("should have service instance", () => {
    expect(userService).toBeDefined();
  });

  it("service should have getProfile method", () => {
    expect(typeof userService.getProfile).toBe("function");
  });

  it("service should have updateProfile method", () => {
    expect(typeof userService.updateProfile).toBe("function");
  });

  it("service should have getPreferences method", () => {
    expect(typeof userService.getPreferences).toBe("function");
  });

  it("service should have updatePreferences method", () => {
    expect(typeof userService.updatePreferences).toBe("function");
  });

  it("service should have getSubscription method", () => {
    expect(typeof userService.getSubscription).toBe("function");
  });

  it("service should have toggleSubscription method", () => {
    expect(typeof userService.toggleSubscription).toBe("function");
  });
});