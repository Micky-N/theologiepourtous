import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique, Default, HasMany, HasOne } from 'sequelize-typescript';
import { UserProgress } from './UserProgress';
import { BibleBookmark } from './BibleBookmark';
import { BibleNote } from './BibleNote';
import { ReadingSession } from './ReadingSession';
import { UserPreference } from './UserPreference';

@Table({
    tableName: 'users',
    timestamps: true
})
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Unique
    @Column(DataType.STRING)
    declare email: string;

    @Column(DataType.STRING)
    declare name: string;

    @Column(DataType.STRING)
    declare password: string;

    @Default('USER')
    @Column(DataType.ENUM('USER', 'ADMIN'))
    declare role: 'USER' | 'ADMIN';

    @Column(DataType.DATE)
    declare lastLogin?: Date;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare createdAt: Date;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare updatedAt: Date;

    @HasMany(() => BibleBookmark)
    declare bibleBookmarks: BibleBookmark[];

    @HasMany(() => BibleNote)
    declare bibleNotes: BibleNote[];

    @HasMany(() => ReadingSession)
    declare readingSessions: ReadingSession[];

    @HasOne(() => UserPreference)
    declare userPreference: UserPreference;

    @HasMany(() => UserProgress)
    declare userProgress: UserProgress[];
}
