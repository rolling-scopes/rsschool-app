import { ApiProperty } from '@nestjs/swagger';
import { HeroRadar, HeroRadarDto } from './hero-radar.dto';
import { PaginationMeta } from 'src/core/paginate';
import { PaginationMetaDto } from 'src/core/paginate/dto/Paginate.dto';

export class HeroesRadarDto {
  constructor({ items, meta }: { items: HeroRadar[]; meta: PaginationMeta }) {
    this.content = items.map(item => new HeroRadarDto(item));
    this.pagination = new PaginationMetaDto(meta);
  }

  @ApiProperty({ type: [HeroRadarDto] })
  public content: HeroRadarDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
