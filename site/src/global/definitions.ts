export interface MarkdownContent {
    title?: string;
    description?: string;
    url?: string;
    contributors?: string[];
    headings?: MarkdownHeading[];
    srcPath?: string;
    content?: string;
  }
  
  export interface MarkdownHeading {
    id: string;
    level: number;
    text: string;
  }
  
  export interface SiteStructureItem {
    text: string,
    url?: string;
    filePath?: string;
    children?: SiteStructureItem[];
  }
  