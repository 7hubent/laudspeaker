import { Account } from '@/api/accounts/entities/accounts.entity';
import { Workflow } from '@/api/workflows/entities/workflow.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Segment {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  @ManyToOne(() => Account, (account) => account.id)
  public user: Account;

  @Column()
  public name: string;

  /*
      {
          conditionalType: ...,
          conditions: [
            {
              attribute: "email",
              "value": "doesNotExist"
            },
            {
              "attribute": "lastName",
              "condition": "isEqual",
              "value": "hello"
            }
          ]
        }
  */
  @Column('jsonb', { default: { conditionalType: 'and', conditions: [] } })
  public inclusionCriteria: any;

  @Column({ default: false })
  public isFreezed: boolean;

  @OneToMany(() => Workflow, (wf) => wf.segment)
  public workflows: Workflow[];

  @Column('jsonb')
  public resources: any;
}
