import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { BibleBook } from './BibleBook';
import { BibleVersion } from './BibleVersion';
import { BibleBookmark } from './BibleBookmark';
import { BibleNote } from './BibleNote';

@Table({
    tableName: 'bible_verses',
    timestamps: true
})
export class BibleVerse extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column(DataType.INTEGER)
    declare chapter: number;

    @Column(DataType.INTEGER)
    declare verse: number;

    @Column(DataType.TEXT)
    declare text: string;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare createdAt: Date;

    @ForeignKey(() => BibleVersion)
    @Column(DataType.INTEGER)
    declare versionId: number;

    @ForeignKey(() => BibleBook)
    @Column(DataType.INTEGER)
    declare bookId: number;

    @BelongsTo(() => BibleBook)
    declare book: BibleBook;

    @BelongsTo(() => BibleVersion)
    declare version: BibleVersion;

    @HasMany(() => BibleBookmark)
    declare bookmarks: BibleBookmark[];

    @HasMany(() => BibleNote)
    declare notes: BibleNote[];
}
