import { authService } from "@/features/auth/service";

describe("AuthService", () => {
  it("should have service instance", () => {
    expect(authService).toBeDefined();
  });

  it("service should have login method", () => {
    expect(typeof authService.login).toBe("function");
  });

  it("service should have register method", () => {
    expect(typeof authService.register).toBe("function");
  });

  it("service should have logout method", () => {
    expect(typeof authService.logout).toBe("function");
  });

  it("service should have refreshSession method", () => {
    expect(typeof authService.refreshSession).toBe("function");
  });
});