export type DataExtractorOptions = {
  outputPath: string;
  stripFolderPrefixes? : boolean;
};

export type DataExtractorResult = {
  outputId: string;
  completed: boolean;
};

export type DataExtractor = (opts: DataExtractorOptions) => Promise<DataExtractorResult>;
