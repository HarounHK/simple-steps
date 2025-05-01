import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import Chat from "@/app/models/chat";

export async function GET(req: Request) {
  // @ts-expect-error sss
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectMongoDB();

  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const url = new URL(req.url); 
  const chatId = url.searchParams.get("id");

// @ts-expect-error sss
  const chat = await Chat.findOne({ _id: chatId, userId: user._id }).lean();
    // @ts-expect-error sss
  return NextResponse.json({ history: chat?.messages || [] });
}
