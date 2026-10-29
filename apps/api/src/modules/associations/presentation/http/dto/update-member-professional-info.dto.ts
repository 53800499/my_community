import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class UpdateMemberProfessionalInfoDto {
  @ApiPropertyOptional({
    description: 'Poste actuel, profession ou fonction',
    example: 'Ingénieur Logiciel & Consultant Cloud',
  })
  @IsOptional()
  @IsString()
  currentJobTitle?: string;

  @ApiPropertyOptional({
    description: 'Entreprise, cabinet, administration ou établissement employeur',
    example: 'Eskay Tech Solutions',
  })
  @IsOptional()
  @IsString()
  companyOrOrganization?: string;

  @ApiPropertyOptional({
    description: 'Secteur d’activité (ex: Technologies, Santé, BTP, Éducation, Droit, Finance)',
    example: 'Technologies & Systèmes d’Information',
  })
  @IsOptional()
  @IsString()
  industrySector?: string;

  @ApiPropertyOptional({
    description: 'Années d’expérience professionnelle cumulée',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @ApiPropertyOptional({
    description: 'Diplôme ou qualification la plus élevée',
    example: 'Master 2 en Génie Logiciel & Réseaux',
  })
  @IsOptional()
  @IsString()
  highestDegree?: string;

  @ApiPropertyOptional({
    description: 'Compétences clés, technologies ou savoir-faire',
    type: [String],
    example: ['TypeScript', 'NestJS', 'PostgreSQL', 'Gestion de Projets'],
  })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Lien du profil LinkedIn officiel',
    example: 'https://linkedin.com/in/mon-profil',
  })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: 'Site web, portfolio ou lien du CV',
    example: 'https://monportfolio.pro',
  })
  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @ApiPropertyOptional({
    description: 'Courte biographie ou présentation professionnelle',
    example: 'Professionnel passionné par l’impact social et le développement technologique en Afrique.',
  })
  @IsOptional()
  @IsString()
  professionalBio?: string;

  @ApiPropertyOptional({
    description: 'Disponible pour mentorer les plus jeunes adhérents',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailableForMentoring?: boolean;

  @ApiPropertyOptional({
    description: 'Ouvert aux opportunités d’emploi ou de partenariats',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  lookingForOpportunities?: boolean;
}
