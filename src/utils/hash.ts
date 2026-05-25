import * as bcrypt from 'bcrypt';

export async function hashMaker(password: string){
  const salt = 10;
  const hash = await bcrypt.hash(password, salt)
  return hash
} 
  