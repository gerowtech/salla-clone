import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
export class RegisterDto {
 @IsEmail() email!: string;
 @IsString() @MinLength(8) password!: string;
 @IsString() firstName!: string;
 @IsString() lastName!: string;
 @IsString() companyName!: string;
}
export class LoginDto {
 @IsEmail() email!: string;
 @IsString() @MinLength(1) password!: string;
}
export class SelectCompanyDto {
 @IsString() companyId!: string;
}
