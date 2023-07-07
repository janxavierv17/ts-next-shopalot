import prisma from "@/prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const users = await prisma.user.findMany();
		return NextResponse.json({ users });
	} catch (err) {}
}
