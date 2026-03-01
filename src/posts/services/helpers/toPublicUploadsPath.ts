import * as path from 'path';

export function toPublicUploadsPath(absolutePath: string) {
    const cwd = process.cwd();
    const rel = path.relative(cwd, absolutePath).split(path.sep).join('/');
    return '/' + rel;
}
