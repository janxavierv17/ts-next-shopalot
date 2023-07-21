import { getEnvVariable } from "./helper";
import { SignJWT, jwtVerify } from "jose";
import { logger } from "./logger";

// Responsible for generating a JWT based on the provided arguments and returning the token.
export const signJWT = async (
	payload: { subject: string },
	options: { expiration: string }
) => {
	try {
		const secret = new TextEncoder().encode(
			getEnvVariable("JWT_SECRET_KEY")
		);
		const algorithm = "HS256";
		return new SignJWT(payload)
			.setProtectedHeader({ alg: algorithm })
			.setExpirationTime(options.expiration)
			.setIssuedAt()
			.setSubject(payload.subject)
			.sign(secret);
	} catch (ex) {
		logger.debug(`[token.ts] ${ex}`);
		throw ex;
	}
};

//  verifyJWT function servces the purpose of validating and decoding a JWT token.
export const verifyJWT = async <T>(token: string): Promise<T> => {
	try {
		// We use the dot notation to access the secret key because we'll be using this function on Next.js's middleware.
		// Using our getEnvVariable function won't work.
		return (
			await jwtVerify(
				token,
				new TextEncoder().encode(process.env.JWT_SECRET_KEY)
			)
		).payload as T;
	} catch (error) {
		logger.error(error);
		throw new Error("Your token has expired.");
	}
};
