import {
  filterSourceFiles as filterSourceFilesCore,
  getDiffInfo as getDiffInfoCore,
  SOURCE_FILE_PATTERN_VUE,
} from '@framework-doctor/core';

export const getDiffInfo = getDiffInfoCore;

export const filterSourceFiles = (files: string[]): string[] =>
  filterSourceFilesCore(files, SOURCE_FILE_PATTERN_VUE);
