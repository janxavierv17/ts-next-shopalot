import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";

// Retrieving the value of an environment variable from the process.env object
type EnvVariableKey = "JWT_SECRET_KEY" | "JWT_EXPIRES_IN";
export function getEnvVariable(key: EnvVariableKey): string {
	const value = process.env[key];
	if (!value || value.length === 0) {
		logger.error(`The environment variable key: ${key} is not set.`);
		throw new Error(`The environment variable key: ${key} is not set.`);
	}
	return value;
}

// A function that can generate error responses dynamically based on provided arguments.
export function getErrorResponse(
	status: number | null = null,
	message: string,
	errors: ZodError | null = null
) {
	// If the status is not provided, default it to 500 (Internal Server Error)
	const statusCode = status || 500;

	return new NextResponse(
		JSON.stringify({
			status: statusCode < 500 ? "fail" : "error",
			message,
			errors: errors ? errors.flatten() : null,
		}),
		{ status: statusCode, headers: { "Content-Type": "application/json" } }
	);
}
