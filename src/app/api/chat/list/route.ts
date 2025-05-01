import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import Chat from "@/app/models/chat";

export async function GET() {
  // @ts-expect-errorfff
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectMongoDB();
  const user = await User.findOne({ email: session.user.email });
  const chats = await Chat.find({ userId: user._id })
    .sort({ updatedAt: -1 })
    .select("_id title");

  return NextResponse.json({ chats });
}
