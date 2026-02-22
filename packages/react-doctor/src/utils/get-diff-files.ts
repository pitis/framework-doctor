import {
  filterSourceFiles as filterSourceFilesCore,
  getDiffInfo as getDiffInfoCore,
  SOURCE_FILE_PATTERN_REACT,
} from '@framework-doctor/core';

export const getDiffInfo = getDiffInfoCore;

export const filterSourceFiles = (filePaths: string[]): string[] =>
  filterSourceFilesCore(filePaths, SOURCE_FILE_PATTERN_REACT);
