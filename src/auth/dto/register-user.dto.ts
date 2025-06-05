import { IsEmail, IsString, MaxLength, MinLength } from "class-validator"

export class RegisterUserDto{

    @IsString()
    name:string 

    @IsString()
    @IsEmail()
    email:string 

    @IsString()
    @MinLength(6)
    @MaxLength(14)
    password:string
}