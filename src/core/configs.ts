export const frontendUrl =
  process.env.NODE_ENV === "production"
    ? "http://localhost:3000"
    : "http://localhost:3000";

export const baseUrl =
  process.env.NODE_ENV === "production"
    ? "http://localhost:7000"
    : "http://localhost:7000";

export const docTitle = "NUI Fashion API Documentation";
