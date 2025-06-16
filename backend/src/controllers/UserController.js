import { User } from "../models/UserModel.js";
import bcrypt,{hash} from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { randomBytes } from "crypto";


const register = async (req, res) => {
  const { name, username, password } = req.body;
  try {
    const isexisting = await User.findOne({ username });
    if (isexisting) {
      return res.status(httpStatus.FOUND).json({ message: "User already exists" });
    }
    const hashedpassword = await hash(password,10);

    const user = await User.create({
        name,
        username,
        password:hashedpassword,
        // token:user._id
        
    })

    return res.status(StatusCodes.CREATED).json({message:"New User registered"});
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:`${err}`});
  }
};

const login = async (req,res)=>{
    const {username,password} = req.body;
    if(!username || !password){
         return res.status(400).json({message:"provide details"});
    }

    try{
        const user = await User.findOne({username});
        if(!user){
            return res.status(StatusCodes.NOT_FOUND).json({message:" No user Found"});
        }
        if(bcrypt.compare(password,user.password)){
            let token = randomBytes(20).toString("hex")
            user.token = token;
            await user.save()
            return res.status(StatusCodes.OK).json({token:token});
        }

    }catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:`${err}`});
    }
}

export {login,register}
