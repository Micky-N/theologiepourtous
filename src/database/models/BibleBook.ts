import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, HasMany } from 'sequelize-typescript';
import type { Testament } from '../../enums/bibleType';
import { BibleBookmark } from './BibleBookmark';
import { BibleNote } from './BibleNote';
import { BibleVerse } from './BibleVerse';

@Table({
    tableName: 'bible_books',
    timestamps: true
})
export class BibleBook extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, unique: true })
    declare code: string;

    @Column(DataType.STRING)
    declare name: string;

    @Column(DataType.ENUM('OLD', 'NEW'))
    declare testament: Testament;

    @Column(DataType.INTEGER)
    declare orderIndex: number;

    @Column(DataType.INTEGER)
    declare chapterCount: number;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare createdAt: Date;

    @HasMany(() => BibleBookmark)
    declare bookmarks: BibleBookmark[];

    @HasMany(() => BibleNote)
    declare notes: BibleNote[];

    @HasMany(() => BibleVerse)
    declare verses: BibleVerse[];
}
