import { IsNotEmpty } from 'class-validator';

export class FileUploadDto {
  @IsNotEmpty()
  file: any;
}
