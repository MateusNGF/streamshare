export type ActionErrorCode =
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "CONFLICT"
    | "INTERNAL_ERROR"
    | "INVALID_TOKEN"
    | "EXPIRED"
    | "ALREADY_USED";

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
    code?: ActionErrorCode | string;
}
