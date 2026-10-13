import { ApiProperty } from '@nestjs/swagger';

export class PublicApiError {
  @ApiProperty({ example: 'VALIDATION_FAILED' })
  code!: string;

  @ApiProperty({ example: 'Check the submitted information.' })
  message!: string;
}

export class ApiErrorResponse {
  @ApiProperty({ type: PublicApiError })
  error!: PublicApiError;

  @ApiProperty({ format: 'uuid' })
  requestId!: string;
}
