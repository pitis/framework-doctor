export interface SecurityRule {
  id: string;
  pattern: RegExp;
  message: string;
  help: string;
  severity: 'error' | 'warning';
  fileExtensions: string[];
  skipCommentOnlyLines?: boolean;
}
