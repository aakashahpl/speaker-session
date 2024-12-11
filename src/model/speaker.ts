export interface Speaker{
    id:Number,
    first_name:String,
    last_name:String,
    email:String,
    is_verified:Boolean,
    user_type:String,
    created_at:Date
    password:String
}

export interface SpeakerProfile {
    id: number;
    user_id: number;
    expertise: string;
    price_per_session: number;
  }
  