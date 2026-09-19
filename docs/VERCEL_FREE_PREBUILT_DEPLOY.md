# Free prebuilt Vercel deploy

When Vercel's Git-triggered remote build queue is temporarily rate-limited, Relyo can still keep a zero-paid deployment path by building the Vercel Build Output on GitHub's standard hosted runner and uploading that output with `vercel deploy --prebuilt --prod`.

## Why this avoids the blocked path

`vercel build --prod` runs in GitHub Actions. The final Vercel command uploads an already-built `.vercel/output`, so the Vercel remote build is not the build executor.

The repository intentionally triggers this workflow with `.vercel-prebuilt-deploy-trigger`, a path that is not considered web-relevant by the Vercel `ignoreCommand`. That prevents the same commit from unnecessarily consuming a Git-triggered remote build attempt.

## One-time credential requirement

The workflow needs a project-scoped Vercel token because Vercel CLI deployments from external CI require authentication.

Store it only as the GitHub repository Actions secret:

`VERCEL_TOKEN`

Do not commit it, paste it into an issue, add it to a Passport, or send it in chat.

Project/team identifiers are deliberately non-secret and are committed in the workflow:

- project: `prj_GdpW8gbUqsjZx84AtoHq2twAl7gi`
- team: `team_BsJXXtOBNmww7MhlgiE7JzzO`

After the secret exists, changing `.vercel-prebuilt-deploy-trigger` launches the free prebuilt production path automatically.


## Scoped token behavior

Project-scoped Vercel access tokens infer their project/team context automatically. The workflow therefore does not pass `--scope`; it relies on `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, and the scoped token. This avoids the CLI account lookup path that can return `User not found (404)` for project-scoped tokens.
