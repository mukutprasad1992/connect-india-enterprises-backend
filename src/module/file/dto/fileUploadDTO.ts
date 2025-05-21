export class FileUploadDto {
    mediaType: 'image' | 'video' | 'document' | undefined;
    description?: string;
}
