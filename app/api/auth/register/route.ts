import { getErrorResponse } from "@/app/_utils/helper";
import prisma from "@/prisma/client";
import {
	RegisterUserInput,
	RegisterUserSchema,
} from "@/app/_utils/validations/user.schema";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/app/_utils/logger";
import { ZodError } from "zod";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
	try {
		const body: RegisterUserInput = await req.json();
		logger.info(`Body => ${JSON.stringify(body, null, 2)}`);

		const { name, email, password, photo } = RegisterUserSchema.parse(body);
		const hashedPassword = await hash(password, 12);

		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				photo,
			},
		});

		return new NextResponse(
			JSON.stringify({
				status: "success",
				data: { user: { ...user, password: undefined } },
			}),
			{
				status: 201,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (ex: any) {
		logger.error(`[postRegister.ts] ${JSON.stringify(ex)}`);

		if (ex instanceof ZodError) {
			return getErrorResponse(400, "failed validations", ex);
		}

		if (ex.code === "P2002") {
			return getErrorResponse(409, "user with that email already exist");
		}

		return getErrorResponse(500, ex.message);
	}
}
