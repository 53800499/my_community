import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MandateOfficerResponseDto {
  @ApiProperty({ example: 'stat-pres-123' })
  positionId!: string;

  @ApiProperty({ example: 'Président(e) du Bureau Exécutif' })
  positionTitle!: string;

  @ApiProperty({ example: 'u-pres-1' })
  userId!: string;

  @ApiProperty({ example: 'Sèdami Akindès' })
  userName!: string;

  @ApiProperty({ example: 'PRESIDENT' })
  roleCategory!: string;

  @ApiPropertyOptional({ example: '2024-10-15T00:00:00.000Z' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-10-14T23:59:59.000Z' })
  endDate?: string;
}

export class AssociationMandateResponseDto {
  @ApiProperty({ example: 'mandate-123' })
  id!: string;

  @ApiProperty({ example: 'assoc-123' })
  associationId!: string;

  @ApiProperty({ example: 'Mandat 2024-2025 : Solidarité Étudiante' })
  title!: string;

  @ApiProperty({ example: '2024-2025' })
  academicYear!: string;

  @ApiProperty({ example: '2024-10-15T00:00:00.000Z' })
  startDate!: string;

  @ApiPropertyOptional({ example: '2025-10-14T23:59:59.000Z' })
  endDate?: string | null;

  @ApiProperty({ enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'], example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: 'u-pres-1' })
  presidentUserId!: string;

  @ApiProperty({ example: 'Sèdami Akindès' })
  presidentName!: string;

  @ApiPropertyOptional({ example: 'u-sec-1' })
  secretaryUserId?: string | null;

  @ApiPropertyOptional({ example: 'Roméo Hounkpatin' })
  secretaryName?: string | null;

  @ApiPropertyOptional({ example: 'u-tres-1' })
  treasurerUserId?: string | null;

  @ApiPropertyOptional({ example: 'Inès Houndégla' })
  treasurerName?: string | null;

  @ApiProperty({ type: [MandateOfficerResponseDto] })
  officers!: MandateOfficerResponseDto[];

  @ApiPropertyOptional({ example: '2024-10-15T10:00:00.000Z' })
  handoverDate?: string | null;

  @ApiPropertyOptional({ example: 'Dr. Armand Gbaguidi' })
  outgoingPresidentName?: string | null;

  @ApiPropertyOptional({ example: 'Sèdami Akindès' })
  incomingPresidentName?: string | null;

  @ApiPropertyOptional({ example: 'Transmission de l’inventaire et du solde de caisse.' })
  handoverNotes?: string | null;

  @ApiProperty({ example: 350000 })
  treasuryTransferredAmount!: number;

  @ApiPropertyOptional({ example: 'PV-HANDOVER-2024-001' })
  pvDocumentRef?: string | null;

  @ApiPropertyOptional({ example: '2024-10-15T12:00:00.000Z' })
  signedAt?: string | null;

  @ApiProperty({ example: '2024-10-15T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-10-15T00:00:00.000Z' })
  updatedAt!: string;
}
