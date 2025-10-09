import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, ForeignKey, BelongsTo, Unique } from 'sequelize-typescript';
import { User } from './User';
import { BibleVersion } from './BibleVersion';

@Table({
    tableName: 'user_preferences',
    timestamps: true
})
export class UserPreference extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => BibleVersion)
    @Column(DataType.INTEGER)
    declare defaultVersionId: number | null;

    @Default(false)
    @Column(DataType.BOOLEAN)
    declare notesPerVersion: boolean;

    @Default(false)
    @Column(DataType.BOOLEAN)
    declare bookmarksPerVersion: boolean;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare createdAt: Date;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare updatedAt: Date;

    @Unique
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    @BelongsTo(() => BibleVersion)
    declare defaultVersion: BibleVersion | null;

    @BelongsTo(() => User)
    declare user: User;
}
