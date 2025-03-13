import { ParsedQs } from "qs";

declare global {
  namespace Express {
    export interface Request {
      designer?: string;
    }
  }
}
