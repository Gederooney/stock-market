import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  timezone: z.string().default('UTC'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export class UserEntity {
  private constructor(private readonly props: User) {}

  static create(props: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): UserEntity {
    const user: User = {
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return new UserEntity(user);
  }

  static fromPersistence(props: User): UserEntity {
    return new UserEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  toJSON(): User {
    return this.props;
  }
}