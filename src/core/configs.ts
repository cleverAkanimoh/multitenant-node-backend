export const frontendUrl =
  process.env.NODE_ENV === "production"
    ? "http://localhost:3000"
    : "http://localhost:3000";

export const baseUrl =
  process.env.NODE_ENV === "production"
    ? "http://localhost:8000"
    : "http://localhost:8000";

export const docTitle = "Emetrics Suite API Documentation";
