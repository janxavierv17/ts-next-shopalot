/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "./app/_utils/token";
import { getErrorResponse } from "./app/_utils/helper";
import { logger } from "./app/_utils/logger";

// https://codevoweb.com/jwt-authentication-in-nextjs-13-api-route-handlers/

interface AuthenticatedRequest extends NextRequest {
	user: {
		id: string;
	};
}

let redirectToLogin = false;
// Changed the type of req object to AuthenticatedRequest because of line 47
export async function middleware(req: AuthenticatedRequest) {
	let token: string | undefined;
	if (req.cookies.has("token")) {
		token = req.cookies.get("token")?.value;
	} else if (req.headers.get("Authorization")?.startsWith("Bearer ")) {
		token = req.headers.get("Authorization")?.substring(7);
	}

	if (
		req.nextUrl.pathname.startsWith("/login") &&
		(!token || redirectToLogin)
	)
		return;

	if (
		!token &&
		(req.nextUrl.pathname.startsWith("api/users") ||
			req.nextUrl.pathname.startsWith("/api/auth/logout"))
	) {
		return getErrorResponse(
			401,
			"You are not logged in.Please provide a token to gain access."
		);
	}

	const response = NextResponse.next();
	try {
		if (token) {
			const { sub } = await verifyJWT<{ sub: string }>(token);
			response.headers.set("X-USER-ID", sub);

			// Weird syntax
			// (req as AuthenticatedRequest).user = { id: sub };
			req.user = { id: sub };
		}
	} catch (ex) {
		console.log(`[middleware.ts] ${ex}`);
		redirectToLogin = true;
		if (req.nextUrl.pathname.startsWith("/api")) {
			return getErrorResponse(
				401,
				"Token is invalid or user doesn't exist."
			);
		} else {
			// What is this ??
			return NextResponse.redirect(
				new URL(
					`/login?${new URLSearchParams({ error: "badauth" })}`,
					req.url
				)
			);
		}
	}

	const authUser = req.user;
	if (!authUser) {
		return NextResponse.redirect(
			new URL(
				`/login?${new URLSearchParams({
					error: "badauth",
					forceLogin: "true",
				})}`,
				req.url
			)
		);
	}

	if (req.url.includes("/login") && authUser) {
		return NextResponse.redirect(new URL("/profile", req.url));
	}

	return response;
}

export const config = {
	matcher: ["/profile", "/login", "/api/users/:path*", "/api/auth/logout"],
};
