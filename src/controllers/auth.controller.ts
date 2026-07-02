import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const register = async(req:any,res:any)=>{

try{

const {
name,
email,
password
}=req.body;


// check existing user

const existingUser = await prisma.user.findUnique({
where:{
email
}
});


if(existingUser){

return res.status(400).json({
message:"User already exists"
});

}


// hash password

const hashedPassword =
await bcrypt.hash(password,10);


// create user

const user = await prisma.user.create({

data:{
name,
email,
password:hashedPassword
}

});


res.status(201).json({

message:"User created successfully",

user:{
id:user.id,
name:user.name,
email:user.email
}

});


}
catch(error){

console.log(error);

res.status(500).json({
message:"Server error"
});

}

}

export const login = async (req: any, res: any) => {
  try {

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }
};