import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },

        email:{
            type:String,
            required:true,
            unique:true,
        },
         password: {
      type: String,
      required: true,
    },

    gender:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
        required:true,
    },


     refreshToken: {
      type: String,
      default: "",
    },

    },
    {timestamps:true}
);

userSchema.pre("save", async function(){
   if(!this.isModified("password")) // if password not changed skip hashing beacuse when user-> updates email this happens -> user.save(); but in case we dont want to hash it again.
     return ;

   const salt = await bcrypt.genSalt(10);
   this.password=await bcrypt.hash(this.password, salt);

});

userSchema.methods.comparePassword=async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

const User=mongoose.model("User",userSchema);



export default User;