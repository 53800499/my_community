import { IsNotEmpty, IsString, MinLength, IsOptional, IsEmail, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Numéro de téléphone au format national ou international (ex: Bénin +229 ou 8 à 15 chiffres)',
    example: '+22997001122',
    format: 'e.164',
    minLength: 8,
    maxLength: 16,
  })
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères.' })
  @Matches(/^\+?[0-9\s\-()]{8,18}$/, {
    message: 'Le format du numéro de téléphone est invalide.',
  })
  phoneNumber!: string;

  @ApiProperty({
    description: 'Mot de passe sécurisé du compte citoyen (au moins 8 caractères)',
    example: 'MotDePasseSecurise2026!',
    minLength: 8,
    format: 'password',
  })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  @MinLength(8, { message: 'Le mot de passe doit comporter au moins 8 caractères.' })
  password!: string;

  @ApiPropertyOptional({
    description: 'Adresse email unique optionnelle du citoyen',
    example: 'citoyen@cotonou.bj',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Adresse email invalide.' })
  email?: string;
}
