import { ApiProperty } from '@nestjs/swagger';
import { HeroRadar, HeroRadarDto } from './hero-radar.dto';
import { PaginationMeta } from 'src/core/paginate';
import { PaginationMetaDto } from 'src/core/paginate/dto/Paginate.dto';

interface HeroesRadar {
  heroes: HeroRadar[];
  meta: PaginationMeta;
}

const calculateRank = ({ heroes, meta }: HeroesRadar): HeroRadar[] => {
  const rankedHeroes = heroes.map((hero, index) => {
    const rank = index + 1 + meta.pageSize * (meta.current - 1);
    return { ...hero, rank };
  });
  return rankedHeroes;
};

export class HeroesRadarDto {
  constructor(heroesRadar: HeroesRadar) {
    this.content = calculateRank(heroesRadar).map(hero => new HeroRadarDto(hero));
    this.pagination = new PaginationMetaDto(heroesRadar.meta);
  }

  @ApiProperty({ type: [HeroRadarDto] })
  public content: HeroRadarDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
