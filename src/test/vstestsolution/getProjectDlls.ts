import * as fs from 'fs'
import * as path from 'path'
import {resolve} from 'path'
import {getStringInput} from '../../helpers'
import {TestProjectFolder} from './getTestProjectFolders'

export function getProjectDlls(projectFolders: TestProjectFolder[]): string[] {
  let projectDlls: string[] = []
  const configuration = getStringInput('configuration', {
    defaultValue: 'find'
  }).toLowerCase()

  for (const projectFolder of projectFolders) {
    let thisProjectDlls: string[] = []
    switch (configuration) {
      case 'find':
        thisProjectDlls = findDlls(projectFolder)
        break
      case 'debug':
        thisProjectDlls = getDlls(projectFolder, 'Debug')
        break
      case 'release':
        thisProjectDlls = getDlls(projectFolder, 'Release')
        break
      default:
        throw new Error('unsupported configuration input')
    }

    if (thisProjectDlls.length === 0) {
      throw new Error(
        `cannot find ${projectFolder.name} with configuration ${configuration}`
      )
    }
    projectDlls = projectDlls.concat(thisProjectDlls)
  }
  return projectDlls
}

function findDlls(projectFolder: TestProjectFolder): string[] {
  let dlls = getDlls(projectFolder, 'Release')
  if (dlls.length === 0) {
    dlls = getDlls(projectFolder, 'Debug')
  }
  return dlls
}

/* function getReleaseDll(projectFolder: TestProjectFolder): string {
  return getDll(projectFolder, 'Release')
}
function getDebugDll(projectFolder: TestProjectFolder): string {
  return getDll(projectFolder, 'Debug')
} */

function getDlls(
  projectFolder: TestProjectFolder,
  configuration: 'Debug' | 'Release'
): string[] {
  const nonMultiTargetedPath = getDll(projectFolder, configuration)
  const nonMultiTargetedExists = fs.existsSync(nonMultiTargetedPath)
  if (nonMultiTargetedExists) {
    return [nonMultiTargetedPath]
  }

  const dlls: string[] = []
  const projectFolderPath = projectFolder.path
  const binConfigFolderPath = getBinConfigFolder(
    projectFolderPath,
    configuration
  )
  if (fs.existsSync(binConfigFolderPath)) {
    const fes = fs.readdirSync(binConfigFolderPath, {withFileTypes: true})
    for (const fe of fes) {
      if (fe.isDirectory()) {
        const possibleMultiTargetedDirectory = resolve(
          binConfigFolderPath,
          fe.name
        )
        const possibleMultiTargetedDllPath = path.join(
          possibleMultiTargetedDirectory,
          `${projectFolder.name}.dll`
        )
        if (fs.existsSync(possibleMultiTargetedDllPath)) {
          dlls.push(possibleMultiTargetedDllPath)
        }
      }
    }
  }
  return dlls
}

function getBinConfigFolder(
  projectFolderPath: string,
  configuration: 'Debug' | 'Release'
): string {
  return path.join(projectFolderPath, 'bin', configuration)
}

function getDll(
  projectFolder: TestProjectFolder,
  configuration: string
): string {
  return path.join(
    projectFolder.path,
    'bin',
    configuration,
    `${projectFolder.name}.dll`
  )
}
