import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { chdir } from 'process';

// @ts-ignore
const path_script = import.meta.dirname;
const path_build = path.join(path_script, '../');
const path_root = path.join(path_build, '../');
const path_src = path.join(path_root, 'src');
const path_dist = path.join(path_root, 'dist');

export function build()
{
    fs.rmSync(path_dist, { recursive: true, force: true });
    fs.cpSync(path_src, path_dist, { recursive: true });
    fs.copyFileSync(path.join(path_root, 'package.template.json'), path.join(path_dist, 'package.json'));
}

export function pack()
{
    chdir(path_dist);
    execSync('npm pack');
}
