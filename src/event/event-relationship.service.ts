import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AppDataSource } from '../database/data-source';
import { EventRelationshipEntity } from '../database/entities/eventrelationship.entity';
import { EventEntity } from '../database/entities/event.entity';

@Injectable()
export class EventRelationshipService {
  private relationshipRepository = AppDataSource.getRepository(EventRelationshipEntity);
  private eventRepository = AppDataSource.getRepository(EventEntity);

  async createRelation(parentId: number, childId: number, relationship?: string) {
    if (parentId === childId) {
      throw new BadRequestException('Parent and child cannot be the same event');
    }

    const parent = await this.eventRepository.findOne({ where: { id: parentId } });
    const child = await this.eventRepository.findOne({ where: { id: childId } });

    if (!parent || !child) {
      throw new NotFoundException('Parent or child event not found');
    }

    // Prevent duplicate relation
    const exists = await this.relationshipRepository.findOne({
      where: { parent: { id: parentId }, child: { id: childId } },
    });
    if (exists) {
      return exists;
    }

    const rel = new EventRelationshipEntity();
    rel.parent = parent;
    rel.child = child;
    rel.relationship = relationship;

    return await this.relationshipRepository.save(rel);
  }

  async getRelationsForEvent(eventId: number) {
    const relations = await this.relationshipRepository.createQueryBuilder('r')
      .leftJoinAndSelect('r.parent', 'parent')
      .leftJoinAndSelect('r.child', 'child')
      .where('r.parent_id = :id OR r.children_id = :id', { id: eventId })
      .getMany();

    return relations;
  }

  async deleteRelation(id: number) {
    const rel = await this.relationshipRepository.findOne({ where: { id } });
    if (!rel) {
      throw new NotFoundException('Relation not found');
    }
    await this.relationshipRepository.delete(id);
    return { message: 'Relation deleted' };
  }
}
