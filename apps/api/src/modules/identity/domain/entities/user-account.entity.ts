import { AccountStatus } from '../value-objects/account-status.enum.js';
import { Email } from '../value-objects/email.vo.js';
import { PhoneNumber } from '../value-objects/phone-number.vo.js';
import { PasswordHash } from '../value-objects/password-hash.vo.js';

export interface UserAccountProps {
  id: string;
  email: Email | null;
  phoneNumber: PhoneNumber;
  passwordHash: PasswordHash;
  status?: AccountStatus;
  isPlatformAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entité Métier Pure : Compte Utilisateur (Identity)
 * Encapsule les invariants d'accès, d'authentification et de cycle de vie du compte.
 * 0 dépendance envers NestJS, Prisma ou frameworks externes.
 */
export class UserAccountEntity {
  private readonly _id: string;
  private _email: Email | null;
  private _phoneNumber: PhoneNumber;
  private _passwordHash: PasswordHash;
  private _status: AccountStatus;
  private readonly _isPlatformAdmin: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: string;
    email: Email | null;
    phoneNumber: PhoneNumber;
    passwordHash: PasswordHash;
    status: AccountStatus;
    isPlatformAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._email = props.email;
    this._phoneNumber = props.phoneNumber;
    this._passwordHash = props.passwordHash;
    this._status = props.status;
    this._isPlatformAdmin = props.isPlatformAdmin;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Static Factory Method garantissant la validité initiale de l'entité.
   */
  public static create(props: UserAccountProps): UserAccountEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant du compte est obligatoire.");
    }
    if (!props.phoneNumber) {
      throw new Error('Le numéro de téléphone est obligatoire.');
    }
    if (!props.passwordHash) {
      throw new Error("L'empreinte du mot de passe est obligatoire.");
    }

    const now = new Date();
    return new UserAccountEntity({
      id: props.id,
      email: props.email,
      phoneNumber: props.phoneNumber,
      passwordHash: props.passwordHash,
      status: props.status ?? AccountStatus.ACTIVE,
      isPlatformAdmin: Boolean(props.isPlatformAdmin),
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  public get id(): string {
    return this._id;
  }

  public get isPlatformAdmin(): boolean {
    return this._isPlatformAdmin;
  }

  public get email(): Email | null {
    return this._email;
  }

  public get phoneNumber(): PhoneNumber {
    return this._phoneNumber;
  }

  public get passwordHash(): PasswordHash {
    return this._passwordHash;
  }

  public get status(): AccountStatus {
    return this._status;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public isActive(): boolean {
    return this._status === AccountStatus.ACTIVE;
  }

  public isSuspended(): boolean {
    return this._status === AccountStatus.SUSPENDED;
  }

  public isLocked(): boolean {
    return this._status === AccountStatus.LOCKED;
  }

  public activate(): void {
    if (this._status === AccountStatus.ACTIVE) {
      return;
    }
    this._status = AccountStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  public suspend(): void {
    if (this._status === AccountStatus.SUSPENDED) {
      return;
    }
    this._status = AccountStatus.SUSPENDED;
    this._updatedAt = new Date();
  }

  public lock(): void {
    this._status = AccountStatus.LOCKED;
    this._updatedAt = new Date();
  }

  public changePassword(newPasswordHash: PasswordHash): void {
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  public updateEmail(newEmail: Email | null): void {
    this._email = newEmail;
    this._updatedAt = new Date();
  }
}
