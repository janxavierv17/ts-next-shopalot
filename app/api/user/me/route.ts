import { getErrorResponse } from "@/app/_utils/helper";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/app/_utils/logger";

export async function GET(req: NextRequest) {
	const userId = req.headers.get("X-USER-ID");
	if (!userId)
		return getErrorResponse(
			401,
			"You are not logged in. Please provide a token to gain access"
		);

	const user = await prisma.user.findUnique({ where: { id: userId } });
	logger.debug(`User => ${JSON.stringify(user)}`);

	if (!user) return getErrorResponse(404, "Please create a new account.");
	return NextResponse.json({
		status: "success",
		data: { user: { ...user, password: undefined } },
	});
}
