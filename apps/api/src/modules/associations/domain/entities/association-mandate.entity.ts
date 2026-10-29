export type MandateStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface MandateOfficer {
  positionId: string;
  positionTitle: string;
  userId: string;
  userName: string;
  roleCategory: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AssociationMandateProps {
  id: string;
  associationId: string;
  title: string;
  academicYear: string;
  startDate: Date;
  endDate?: Date | null;
  status?: MandateStatus;
  presidentUserId: string;
  presidentName: string;
  secretaryUserId?: string | null;
  secretaryName?: string | null;
  treasurerUserId?: string | null;
  treasurerName?: string | null;
  officers?: MandateOfficer[];
  handoverDate?: Date | null;
  outgoingPresidentName?: string | null;
  incomingPresidentName?: string | null;
  handoverNotes?: string | null;
  treasuryTransferredAmount?: number;
  pvDocumentRef?: string | null;
  signedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entité Métier Pure : Mandat Associatif & Traçabilité de Période de Service (AssociationMandateEntity)
 * Permet la traçabilité temporelle absolue et immuable de chaque mandature :
 * Période de service, composition du bureau, passation de charge, PV et bilan moral/financier.
 * Conforme SOLID (SRP, DIP) : Encapsulation totale des invariants de passation et clôture de mandat.
 */
export class AssociationMandateEntity {
  private readonly _id: string;
  private readonly _associationId: string;
  private _title: string;
  private _academicYear: string;
  private _startDate: Date;
  private _endDate: Date | null;
  private _status: MandateStatus;
  private _presidentUserId: string;
  private _presidentName: string;
  private _secretaryUserId: string | null;
  private _secretaryName: string | null;
  private _treasurerUserId: string | null;
  private _treasurerName: string | null;
  private _officers: MandateOfficer[];
  private _handoverDate: Date | null;
  private _outgoingPresidentName: string | null;
  private _incomingPresidentName: string | null;
  private _handoverNotes: string | null;
  private _treasuryTransferredAmount: number;
  private _pvDocumentRef: string | null;
  private _signedAt: Date | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: string;
    associationId: string;
    title: string;
    academicYear: string;
    startDate: Date;
    endDate: Date | null;
    status: MandateStatus;
    presidentUserId: string;
    presidentName: string;
    secretaryUserId: string | null;
    secretaryName: string | null;
    treasurerUserId: string | null;
    treasurerName: string | null;
    officers: MandateOfficer[];
    handoverDate: Date | null;
    outgoingPresidentName: string | null;
    incomingPresidentName: string | null;
    handoverNotes: string | null;
    treasuryTransferredAmount: number;
    pvDocumentRef: string | null;
    signedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._associationId = props.associationId;
    this._title = props.title;
    this._academicYear = props.academicYear;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._status = props.status;
    this._presidentUserId = props.presidentUserId;
    this._presidentName = props.presidentName;
    this._secretaryUserId = props.secretaryUserId;
    this._secretaryName = props.secretaryName;
    this._treasurerUserId = props.treasurerUserId;
    this._treasurerName = props.treasurerName;
    this._officers = props.officers;
    this._handoverDate = props.handoverDate;
    this._outgoingPresidentName = props.outgoingPresidentName;
    this._incomingPresidentName = props.incomingPresidentName;
    this._handoverNotes = props.handoverNotes;
    this._treasuryTransferredAmount = props.treasuryTransferredAmount;
    this._pvDocumentRef = props.pvDocumentRef;
    this._signedAt = props.signedAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: AssociationMandateProps): AssociationMandateEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant du mandat est obligatoire.");
    }
    if (!props.associationId || props.associationId.trim().length === 0) {
      throw new Error("L'identifiant de l'association est obligatoire.");
    }
    if (!props.title || props.title.trim().length < 3) {
      throw new Error("Le titre du mandat doit comporter au moins 3 caractères.");
    }
    if (!props.academicYear || props.academicYear.trim().length === 0) {
      throw new Error("L'année académique ou période d'exercice est obligatoire.");
    }
    if (!props.presidentUserId || props.presidentUserId.trim().length === 0) {
      throw new Error("L'identifiant du Président du mandat est obligatoire.");
    }
    if (!props.presidentName || props.presidentName.trim().length === 0) {
      throw new Error("Le nom du Président du mandat est obligatoire.");
    }

    const status: MandateStatus = props.status ?? 'ACTIVE';
    const startDate = props.startDate ?? new Date();

    return new AssociationMandateEntity({
      id: props.id,
      associationId: props.associationId,
      title: props.title.trim(),
      academicYear: props.academicYear.trim(),
      startDate,
      endDate: props.endDate ?? null,
      status,
      presidentUserId: props.presidentUserId.trim(),
      presidentName: props.presidentName.trim(),
      secretaryUserId: props.secretaryUserId ?? null,
      secretaryName: props.secretaryName ?? null,
      treasurerUserId: props.treasurerUserId ?? null,
      treasurerName: props.treasurerName ?? null,
      officers: props.officers ? [...props.officers] : [],
      handoverDate: props.handoverDate ?? null,
      outgoingPresidentName: props.outgoingPresidentName ?? null,
      incomingPresidentName: props.incomingPresidentName ?? null,
      handoverNotes: props.handoverNotes ?? null,
      treasuryTransferredAmount: props.treasuryTransferredAmount ?? 0,
      pvDocumentRef: props.pvDocumentRef ?? null,
      signedAt: props.signedAt ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  /**
   * Clôture formelle du mandat lors de la passation de service.
   */
  public completeMandate(params: {
    endDate?: Date;
    handoverDate?: Date;
    outgoingPresidentName?: string;
    incomingPresidentName?: string;
    handoverNotes?: string;
    treasuryTransferredAmount?: number;
    pvDocumentRef?: string;
    at?: Date;
  }): void {
    const at = params.at ?? new Date();
    this._status = 'COMPLETED';
    this._endDate = params.endDate ?? at;
    this._handoverDate = params.handoverDate ?? at;
    if (params.outgoingPresidentName) {
      this._outgoingPresidentName = params.outgoingPresidentName;
    }
    if (params.incomingPresidentName) {
      this._incomingPresidentName = params.incomingPresidentName;
    }
    if (params.handoverNotes !== undefined) {
      this._handoverNotes = params.handoverNotes;
    }
    if (params.treasuryTransferredAmount !== undefined) {
      this._treasuryTransferredAmount = params.treasuryTransferredAmount;
    }
    if (params.pvDocumentRef) {
      this._pvDocumentRef = params.pvDocumentRef;
    }
    this._signedAt = at;
    this._updatedAt = at;
  }

  /**
   * Met à jour la liste des officiers et responsables en poste sous ce mandat.
   */
  public updateOfficers(officers: MandateOfficer[], at: Date = new Date()): void {
    this._officers = [...officers];
    this._updatedAt = at;
  }

  /**
   * Modifie dynamiquement les métadonnées de la mandature (sans valeur en dur).
   */
  public updateDetails(params: {
    title?: string;
    academicYear?: string;
    startDate?: Date;
    endDate?: Date | null;
    presidentUserId?: string;
    presidentName?: string;
    secretaryUserId?: string | null;
    secretaryName?: string | null;
    treasurerUserId?: string | null;
    treasurerName?: string | null;
    handoverNotes?: string | null;
    treasuryTransferredAmount?: number;
    pvDocumentRef?: string | null;
    at?: Date;
  }): void {
    const at = params.at ?? new Date();
    if (params.title !== undefined) {
      if (params.title.trim().length < 3) {
        throw new Error('Le titre du mandat doit comporter au moins 3 caractères.');
      }
      this._title = params.title.trim();
    }
    if (params.academicYear !== undefined) {
      this._academicYear = params.academicYear.trim();
    }
    if (params.startDate !== undefined) {
      this._startDate = params.startDate;
    }
    if (params.endDate !== undefined) {
      this._endDate = params.endDate;
    }
    if (params.presidentUserId) this._presidentUserId = params.presidentUserId;
    if (params.presidentName) this._presidentName = params.presidentName;
    if (params.secretaryUserId !== undefined) this._secretaryUserId = params.secretaryUserId;
    if (params.secretaryName !== undefined) this._secretaryName = params.secretaryName;
    if (params.treasurerUserId !== undefined) this._treasurerUserId = params.treasurerUserId;
    if (params.treasurerName !== undefined) this._treasurerName = params.treasurerName;
    if (params.handoverNotes !== undefined) this._handoverNotes = params.handoverNotes;
    if (params.treasuryTransferredAmount !== undefined) {
      this._treasuryTransferredAmount = params.treasuryTransferredAmount;
    }
    if (params.pvDocumentRef !== undefined) this._pvDocumentRef = params.pvDocumentRef;
    this._updatedAt = at;
  }

  public activate(at: Date = new Date()): void {
    this._status = 'ACTIVE';
    this._updatedAt = at;
  }

  public archive(at: Date = new Date()): void {
    this._status = 'ARCHIVED';
    this._updatedAt = at;
  }

  public isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  public isCompleted(): boolean {
    return this._status === 'COMPLETED';
  }

  // Getters
  public get id(): string {
    return this._id;
  }
  public get associationId(): string {
    return this._associationId;
  }
  public get title(): string {
    return this._title;
  }
  public get academicYear(): string {
    return this._academicYear;
  }
  public get startDate(): Date {
    return this._startDate;
  }
  public get endDate(): Date | null {
    return this._endDate;
  }
  public get status(): MandateStatus {
    return this._status;
  }
  public get presidentUserId(): string {
    return this._presidentUserId;
  }
  public get presidentName(): string {
    return this._presidentName;
  }
  public get secretaryUserId(): string | null {
    return this._secretaryUserId;
  }
  public get secretaryName(): string | null {
    return this._secretaryName;
  }
  public get treasurerUserId(): string | null {
    return this._treasurerUserId;
  }
  public get treasurerName(): string | null {
    return this._treasurerName;
  }
  public get officers(): MandateOfficer[] {
    return [...this._officers];
  }
  public get handoverDate(): Date | null {
    return this._handoverDate;
  }
  public get outgoingPresidentName(): string | null {
    return this._outgoingPresidentName;
  }
  public get incomingPresidentName(): string | null {
    return this._incomingPresidentName;
  }
  public get handoverNotes(): string | null {
    return this._handoverNotes;
  }
  public get treasuryTransferredAmount(): number {
    return this._treasuryTransferredAmount;
  }
  public get pvDocumentRef(): string | null {
    return this._pvDocumentRef;
  }
  public get signedAt(): Date | null {
    return this._signedAt;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
