import prisma from "@/prisma/client";
import { NextResponse } from "next/server";
import { logger } from "@/app/_utils/logger";

export async function GET(req: Request) {
	try {
		const users = await prisma.user.findMany();
		return NextResponse.json({ users });
	} catch (err) {
		logger.error(`Error => ${err}`);
	}
}
