import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Identifiant de connexion : numéro de téléphone (ex: +22997001122) ou adresse email',
    example: '+22997001122',
  })
  @IsNotEmpty({ message: "L'identifiant (téléphone ou email) est obligatoire." })
  @IsString({ message: "L'identifiant doit être une chaîne de caractères." })
  identifier!: string;

  @ApiProperty({
    description: 'Mot de passe associé au compte citoyen',
    example: 'MotDePasseSecurise2026!',
    format: 'password',
  })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  password!: string;
}
