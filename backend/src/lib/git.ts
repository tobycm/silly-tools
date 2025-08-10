import { exec as cbExec } from "child_process";
import { promisify } from "util";

const exec = promisify(cbExec);

/**
 * Stages all changes, commits them with the given message, and pushes to the remote.
 * This function is idempotent: it will not fail if there are no changes to commit.
 * @param path The local path to the git repository.
 * @param message The commit message.
 */
export async function commitAndPushChanges(path: string, message: string): Promise<void> {
  console.log(`Starting git operations in: ${path}`);
  try {
    // Check for changes first
    const { stdout: status } = await exec(`git -C ${path} status --porcelain`);

    if (status.trim() === "") {
      console.debug("Working tree is clean. No changes to commit or push.");
      return;
    }

    console.debug("Changes detected. Staging files...");
    await exec(`git -C ${path} add .`);

    const escapedMessage = message.replace(/"/g, '\\"');
    console.debug("Committing changes...");
    await exec(`git -C ${path} commit -m "${escapedMessage}"`);

    console.debug("Pushing changes to remote...");
    await exec(`git -C ${path} push`);

    console.debug("Successfully committed and pushed all changes.");
  } catch (error) {
    throw error;
  }
}
