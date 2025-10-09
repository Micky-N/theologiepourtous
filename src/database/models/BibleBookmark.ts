import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { BibleBook } from './BibleBook';
import { BibleVerse } from './BibleVerse';

@Table({
    tableName: 'bible_bookmarks',
    timestamps: true
})
export class BibleBookmark extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column(DataType.STRING)
    declare title: string | null;

    @Default('blue')
    @Column(DataType.STRING)
    declare color: string | null;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare createdAt: Date;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare updatedAt: Date;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    @ForeignKey(() => BibleBook)
    @Column(DataType.INTEGER)
    declare bookId: number;

    @ForeignKey(() => BibleVerse)
    @Column(DataType.INTEGER)
    declare verseId: number;

    @BelongsTo(() => BibleBook)
    declare book: BibleBook;

    @BelongsTo(() => User)
    declare user: User;

    @BelongsTo(() => BibleVerse)
    declare verse: BibleVerse;
}
