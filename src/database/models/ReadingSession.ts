import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { BibleVersion } from './BibleVersion';

@Table({
    tableName: 'reading_sessions',
    timestamps: true
})
export class ReadingSession extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column(DataType.DATE)
    declare startTime: Date;

    @Column(DataType.DATE)
    declare endTime: Date | null;

    @Column(DataType.INTEGER)
    declare duration: number | null;

    @Default('[]')
    @Column(DataType.TEXT)
    declare chaptersRead: string | null;

    @Default(false)
    @Column(DataType.BOOLEAN)
    declare isCompleted: boolean;

    @Default('web')
    @Column(DataType.STRING)
    declare deviceType: string | null;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    declare createdAt: Date;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    @ForeignKey(() => BibleVersion)
    @Column(DataType.INTEGER)
    declare versionId: number;

    @BelongsTo(() => User)
    declare user: User;

    @BelongsTo(() => BibleVersion)
    declare version: BibleVersion;
}
