import { ApiProperty } from '@nestjs/swagger';
import { HeroRadar, HeroRadarDto } from './hero-radar.dto';
import { PaginationMeta } from 'src/core/paginate';
import { PaginationMetaDto } from 'src/core/paginate/dto/Paginate.dto';

const calculateRank = (heroes: HeroRadar[]): HeroRadar[] => {
  const sortedHeroes = [...heroes].sort((a, b) => b.total - a.total);
  const rankedHeroes = heroes.map(hero => {
    const rank = sortedHeroes.findIndex(h => h.total === hero.total) + 1;
    return { ...hero, rank };
  });
  return rankedHeroes;
}

export class HeroesRadarDto {
  constructor({ items, meta }: { items: HeroRadar[]; meta: PaginationMeta }) {
    this.content = calculateRank(items).map((item) => new HeroRadarDto(item));
    this.pagination = new PaginationMetaDto(meta);
  }

  @ApiProperty({ type: [HeroRadarDto] })
  public content: HeroRadarDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
