import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env file");
}


export const verifyToken = (req:Request,res:Response, next: NextFunction) =>{
  const authHeader = req.headers.authorization;

  if(!authHeader){
    return res.status(401).json({message:"Authorization token is required"});
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token,JWT_SECRET)  as { id: string; email: string; user_type: string };
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(403).json(error);
  }
}

export const verifyRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token is required" });
        }

        const token = authHeader.split(" ")[1];
  
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; user_type: string };

            if (!allowedRoles.includes(decoded.user_type)) {
                return res.status(403).json({ message: "You do not have permission to access this route" });
            }

            req.user = { id: decoded.id, email: decoded.email, user_type: decoded.user_type };

            next();
        } catch (error) {
            console.error(error);
            return res.status(403).json({ message: "Invalid or expired token" });
        }
    };
};
