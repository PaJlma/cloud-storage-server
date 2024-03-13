import { IsEmail, IsNotEmpty, IsString } from "class-validator";

class LoginUserDto {
  @IsNotEmpty({ message: "Email не может быть пустым" })
  @IsEmail({}, { message: "Email невалиден" })
  readonly email: string;

  @IsNotEmpty({ message: "Пароль не может быть пустым" })
  @IsString()
  readonly password: string;
}

export default LoginUserDto;
