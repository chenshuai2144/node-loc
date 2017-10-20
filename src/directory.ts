import * as Fs from 'fs-extra';
import * as Glob from 'glob';
import * as Globby from 'globby';
import * as _ from 'lodash';
import * as Path from 'path';

import { LangFile, LineInfo } from './file';

const DefaultInfo: LineInfo = {
    total: 0,
    code: 0,
    comment: 0
};

/**
 * Collect info of a directory.
 *
 * @export
 * @class LangDirectory
 */
export class LangDirectory {
  private pattern: string;
  private info: LineInfo;
  private files: LangFile[];
  private languages: {
    [key: string]: number;
  };

  /**
   * Creates an instance of LangDirectory.
   * @param {string} pattern
   * @memberof LangDirectory
   */
  constructor(pattern: string) {
    this.pattern = pattern;
    const { files, info, languages } = this.loadInfo();
    this.files = files;
    this.info = info;
    this.languages = languages;
  }

  /**
   * load directory info.
   *
   * @private
   * @returns {{
   *     files: LangFile[],
   *     info: LineInfo,
   *     languages: {
   *       [key: string]: number;
   *     }
   *   }}
   * @memberof LangDirectory
   */
  private loadInfo(): {
    files: LangFile[],
    info: LineInfo,
    languages: {
      [key: string]: number;
    }
  } {
      const pathes = Glob.sync(this.pattern);
      const files: LangFile[] = [];
      const info: LineInfo = _.cloneDeep(DefaultInfo);
      const languages: {
        [key: string]: number;
      } = {};

      pathes.map(path => {
        if (path) {
          const fullPath = Path.resolve('./', path);
          const file = new LangFile(fullPath);
          const fileLineInfo = file.getInfo().lines;
          const lang = file.getInfo().lang;

          info.total += fileLineInfo.total;
          info.code += fileLineInfo.code;
          info.comment += fileLineInfo.comment;

          languages[lang] = (languages[lang] || 0) + fileLineInfo.code;
          files.push(file);
        }
      });

      return {
        files,
        info,
        languages
      };
  }

  /**
   * Return detect pattern of the directory.
   *
   * @returns {string}
   * @memberof LangDirectory
   */
  public getPattern(): string {
    return this.pattern;
  }

  /**
   * Return data detected.
   *
   * @returns {LineInfo}
   * @memberof LangDirectory
   */
  public getInfo(): LineInfo {
    return this.info;
  }
}
