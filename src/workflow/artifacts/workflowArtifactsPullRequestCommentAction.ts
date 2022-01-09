import * as core from '@actions/core'
import {getWorkflowArtifactsComment} from './getWorkflowArtifactsComment'
import {workflowGetPullRequest} from '../workflowGetPullRequest'
import {trySetFailedAsync} from '../../helpers/tryCatchSetFailed'
import {getBoolInput} from '../../helpers/inputHelpers'
import {addCommentToPullAndIssues} from '../../comments/addCommentToPullAndIssues'
export async function workflowArtifactsPullRequestCommentAction(): Promise<
  void
> {
  return trySetFailedAsync(async () => {
    core.debug(`workflowGetPullRequest before`)
    const pullRequest = await workflowGetPullRequest()
    core.debug(`workflowGetPullRequest after`)
    if (pullRequest === undefined) {
      throw new Error('no pull request')
    } else {
      core.debug(`getWorkflowArtifactsComment before`)
      const commentStr = await getWorkflowArtifactsComment()
      core.debug(`getWorkflowArtifactsComment after`)
      if (commentStr) {
        core.debug(`addCommentToPullAndIssues before`)
        await addCommentToPullAndIssues(pullRequest, commentStr)
        core.debug(`addCommentToPullAndIssues after`)
      } else {
        const errorNoArtifacts = getBoolInput('errorNoArtifacts', {
          defaultValue: true
        })
        if (errorNoArtifacts) {
          throw new Error('no artifacts')
        }
      }
    }
  })
}
