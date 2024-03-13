import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

class CreateUserDto {
  @IsNotEmpty({ message: "Логин не должен быть пустым" })
  @IsString()
  readonly login: string;

  @IsNotEmpty({ message: "Email не может быть пустым" })
  @IsEmail({}, { message: "Email невалиден" })
  readonly email: string;

  @IsNotEmpty({ message: "Пароль не можеть быть пустым" })
  @IsString()
  @MinLength(5, {
    message: "Пароль не может быть меньше $constraint1 символов",
  })
  readonly password: string;
}

export default CreateUserDto;
