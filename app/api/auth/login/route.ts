import { getEnvVariable, getErrorResponse } from "@/app/_utils/helper";
import prisma from "@/prisma/client";
import { signJWT } from "@/app/_utils/token";
import {
	LoginUserInput,
	LoginUserSchema,
} from "@/app/_utils/validations/user.schema";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/app/_utils/logger";

export async function POST(req: NextRequest) {
	try {
		const body: LoginUserInput = await req.json();
		logger.info(`Body => ${JSON.stringify(body, null, 2)}`);

		const { email, password } = LoginUserSchema.parse(body);
		const user = await prisma.user.findUnique({
			where: { email },
		});
		logger.info(`Existing user => ${password} ${user?.password}`);
		logger.info(
			`Existing user => ${typeof password} ${typeof user?.password}`
		);
		if (!user || !(await compare(password, user.password))) {
			return getErrorResponse(401, "Invalid email or password");
		}

		const JWT_EXPIRES_IN = getEnvVariable("JWT_EXPIRES_IN");
		const token = await signJWT(
			{ subject: user.id },
			{ expiration: `${JWT_EXPIRES_IN}m` }
		);
		const tokenMaxAge = parseInt(JWT_EXPIRES_IN) * 60;
		const cookieOptions = {
			name: "token",
			value: token,
			httpOnly: true,
			path: "/",
			secure: process.env.NODE_ENV !== "development",
			maxAge: tokenMaxAge,
		};
		const response = new NextResponse(
			JSON.stringify({ status: "success", token }),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);

		// [0]the cookie has httpOnly to true making in un-accessible by our frontend. If this doesn't exist then our logged-in cookie shouldn't exist as well.
		// helping us redirect the user to the login page.
		// [1]loggin-in cookie is intentionally set as non-HTTPOnly, allowing use to access it from our frontend.
		// Helps us check if the user has a valid token while moving between pages
		await Promise.all([
			response.cookies.set(cookieOptions),
			response.cookies.set({
				name: "logged-in",
				value: "true",
				maxAge: tokenMaxAge,
			}),
		]);

		return response;
	} catch (ex: any) {
		logger.error(`[postLogin.ts] ${JSON.stringify(ex)}`);

		if (ex instanceof ZodError) {
			return getErrorResponse(400, "failed validations", ex);
		}

		return getErrorResponse(500, ex.message);
	}
}
