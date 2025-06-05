import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { RpcException } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { envs } from '../config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
    private readonly logger=new Logger("AuthService")

    constructor(
        private readonly jwtService:JwtService

    ){
        super()
      }

   async  onModuleInit() {
       await this.$connect()
       this.logger.log("Connected to database")
    
    }
    async verify(token:string){
        try {
            const{sub,iat,exp,...user}=this.jwtService.verify(
                token,{
                secret:envs.jwtSecret}
            )

            return{
                user,
                token:await this.signJwt(user)
            }

        } catch (error) {
            
            throw new RpcException({
                status:401,
                message:"Invalid Token"
            })
        }
    }
    async signJwt(payload:JwtPayload){
        return this.jwtService.sign(payload)
    }

    async login(loginUserDto:LoginUserDto){

        const {email,password}=loginUserDto
        let user=await this.user.findFirst({
            where:{
                email
            }
        })
        if(!user){
            throw new RpcException({
                status:400,
                message:"Unexisting user"
            })
        }

        const isValidPassword=bcrypt.compareSync(password,user.password)
        if(!isValidPassword){
            throw new RpcException({
                status:400,
                message:"User/Password not valid"
            })
        }

        const {password:__,...rest}=user
         
        return{
            user:rest,
            token:await this.signJwt(rest)
        }

    }

    async register(registerUserDto:RegisterUserDto){

        const {email,password,name}=registerUserDto
  
        try {
            const user=await this.user.findFirst({
                where:{
                    email
                }
            })

            if(user){
                throw new RpcException({
                    status:400,
                    message:"User already exists"
                })
            }

           const newUser=await this.user.create({
                data:{
                    email,
                    name,
                    password:bcrypt.hashSync(password,10)
                }
            })
            
            const {password:__,...rest}=newUser
            return{
                user:rest,
                token:await this.signJwt(rest)
            }

            
        } catch (error) {
            throw new RpcException({
                status:400,
                message:error.message
            })
        }

    }

}
