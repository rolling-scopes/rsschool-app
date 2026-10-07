import { ApiProperty } from '@nestjs/swagger';
import type { PaginationMeta } from '../../core/paginate';
import { PersonalAccessTokenDto } from './personal-access-token.dto';

export class PersonalAccessTokenPaginationMetaDto implements PaginationMeta {
  @ApiProperty() itemCount: number;
  @ApiProperty() total: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() current: number;
}

export class PersonalAccessTokenListDto {
  @ApiProperty({ type: [PersonalAccessTokenDto] })
  public items: PersonalAccessTokenDto[];

  @ApiProperty({ type: PersonalAccessTokenPaginationMetaDto })
  public meta: PersonalAccessTokenPaginationMetaDto;

  constructor(items: PersonalAccessTokenDto[], meta: PaginationMeta) {
    this.items = items;
    this.meta = meta;
  }
}
