import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, HasMany } from 'sequelize-typescript';
import { BibleVerse } from './BibleVerse';
import { ReadingSession } from './ReadingSession';
import { UserPreference } from './UserPreference';

@Table({
    tableName: 'bible_versions',
    timestamps: true
})
export class BibleVersion extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, unique: true })
    declare code: string;

    @Column(DataType.STRING)
    declare name: string;

    @Default('fr')
    @Column(DataType.STRING)
    declare language: string;

    @Column(DataType.INTEGER)
    declare year: number | null;

    @Default(true)
    @Column(DataType.BOOLEAN)
    declare isActive: boolean;

    @Default(0)
    @Column(DataType.INTEGER)
    declare orderIndex: number;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare createdAt: Date;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare updatedAt: Date;

    @HasMany(() => BibleVerse)
    declare verses: BibleVerse[];

    @HasMany(() => ReadingSession)
    declare readingSessions: ReadingSession[];

    @HasMany(() => UserPreference)
    declare userPreferences: UserPreference[];
}
