export interface UserProfileProps {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarKey?: string | null;
  bio?: string | null;
  city?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateProfileProps {
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  city?: string | null;
}

/**
 * Entité Métier Pure : Profil Citoyen (UserProfile)
 * Encapsule les informations d'identité publique et d'état civil de l'utilisateur.
 * 0 dépendance envers NestJS, Prisma ou frameworks externes.
 */
export class UserProfileEntity {
  private readonly _id: string;
  private readonly _userId: string;
  private _firstName: string;
  private _lastName: string;
  private _avatarKey: string | null;
  private _bio: string | null;
  private _city: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    avatarKey: string | null;
    bio: string | null;
    city: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._userId = props.userId;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._avatarKey = props.avatarKey;
    this._bio = props.bio;
    this._city = props.city;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: UserProfileProps): UserProfileEntity {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error("L'identifiant du profil est obligatoire.");
    }
    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error("L'identifiant utilisateur (userId) est obligatoire.");
    }

    const trimmedFirstName = props.firstName?.trim();
    if (!trimmedFirstName || trimmedFirstName.length < 1) {
      throw new Error('Le prénom est obligatoire.');
    }

    const trimmedLastName = props.lastName?.trim();
    if (!trimmedLastName || trimmedLastName.length < 1) {
      throw new Error('Le nom de famille est obligatoire.');
    }

    const now = new Date();
    return new UserProfileEntity({
      id: props.id,
      userId: props.userId,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      avatarKey: props.avatarKey?.trim() ?? null,
      bio: props.bio?.trim() ?? null,
      city: props.city?.trim() ?? null,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get firstName(): string {
    return this._firstName;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  public get avatarKey(): string | null {
    return this._avatarKey;
  }

  public get bio(): string | null {
    return this._bio;
  }

  public get city(): string | null {
    return this._city;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateInfo(update: UpdateProfileProps): void {
    if (update.firstName !== undefined) {
      const trimmed = update.firstName.trim();
      if (trimmed.length < 1) {
        throw new Error('Le prénom ne peut pas être vide.');
      }
      this._firstName = trimmed;
    }

    if (update.lastName !== undefined) {
      const trimmed = update.lastName.trim();
      if (trimmed.length < 1) {
        throw new Error('Le nom de famille ne peut pas être vide.');
      }
      this._lastName = trimmed;
    }

    if (update.bio !== undefined) {
      this._bio = update.bio?.trim() ?? null;
    }

    if (update.city !== undefined) {
      this._city = update.city?.trim() ?? null;
    }

    this._updatedAt = new Date();
  }

  public updateAvatar(newAvatarKey: string | null): void {
    this._avatarKey = newAvatarKey?.trim() ?? null;
    this._updatedAt = new Date();
  }
}
