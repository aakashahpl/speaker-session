export interface User{
    id:Number,
    first_name:String,
    last_name:String,
    email:String,
    is_verified:Boolean,
    user_type:String,
    created_at:Date,
    password:String
}

export interface PublicUser {
    id: number;
    email: string;
    user_type:string
  }