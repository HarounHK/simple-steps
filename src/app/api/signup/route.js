import { NextResponse } from 'next/server';
import { connectMongoDB } from "../../lib/mongodb";
import User from "../../models/user";
import bcrypt from "bcryptjs";


export async function POST(request){
    try{
        console.log("Environment Variables at API Route:", process.env); 
        const{name, email, password} = await request.json();
        const hashedPassword = await bcrypt.hash(password, 5);
        await connectMongoDB();
        await User.create({ name, email, password: hashedPassword });

        return NextResponse.json({message: "User registered sucessfully"}, {status: 201});
    }catch(error) { 
        console.error("Error during signup:", error);
        NextResponse.json({message: "An error occured. Failed to register user"}, {status: 501});
    }

}