import type { ReaddirPOptions } from '@ionic/utils-fs';
import { readFileSync, writeFileSync, readdirp } from '@ionic/utils-fs';
import { resolve } from 'path';

import type { Plugin } from '../plugin';

export async function getPluginFiles(plugins: Plugin[]): Promise<string[]> {
        let filenameList: string[] = []

        const options: ReaddirPOptions = {
            filter: (item) => {
                if (item.path.endsWith('.swift') || item.path.endsWith('.m')) {
                    return true
                } else {
                    return false
                }
            }
        }

        for (const plugin of plugins) {
            if (typeof plugin.ios?.name !== 'undefined') {
                const pluginPath = resolve(plugin.rootPath, plugin.ios?.path)
                const filenames = await readdirp(pluginPath, options)
                filenameList = filenameList.concat(filenames)
            }
        }

        return filenameList
}

export async function findPluginClasses(files: string[]): Promise<string[]> {
    const classList: string[] = []

    for (const file of files) {
        const fileData = readFileSync(file, 'utf-8')
        const swiftPluginRegex = RegExp(/@objc\(([A-Za-z0-9_-]+)\)/)
        const objcPluginRegex = RegExp(/CAP_PLUGIN\(([A-Za-z0-9_-]+)/)

        const swiftMatches = swiftPluginRegex.exec(fileData)
        if (swiftMatches?.[1] != null) {
            classList.push(swiftMatches[1])
        }

        const objcMatches = objcPluginRegex.exec(fileData)
        if (objcMatches?.[1] != null) {
            classList.push(objcMatches[1])
        }
    }

    return classList
}

export async function writePluginJSON(fileName: string, classList: string[]): Promise<void> {
    const outputObj = { 'pluginList': classList }
    const outputJSON = JSON.stringify(outputObj, null, 2)
    writeFileSync(fileName, outputJSON)
}
