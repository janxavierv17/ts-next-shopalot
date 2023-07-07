import prisma from "@/prisma/client";
import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
	try {
		const users = await prisma.user.findMany();
		return NextResponse.json({ users });
	} catch (err) {}
}
