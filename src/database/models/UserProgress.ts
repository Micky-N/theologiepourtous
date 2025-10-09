import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
    tableName: 'user_progress',
    timestamps: true
})
export class UserProgress extends Model {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column(DataType.STRING)
    declare theme: string;

    @Column({ type: DataType.TEXT, defaultValue: '[]' })
    declare lessons: string | null;

    @Column(DataType.DATE)
    declare startedAt: Date | null;

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    declare createdAt: Date;

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    declare updatedAt: Date;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;
}
