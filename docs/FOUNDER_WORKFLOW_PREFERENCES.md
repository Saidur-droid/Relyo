# Founder Workflow Preferences

> **Status: Active operating preference**

Relyo's GitHub repository is the permanent source of truth and the preferred handoff location for project work.

## Artifact delivery rule

For Relyo work, when a project artifact, plan, model, presentation source, execution document, ADR, issue, roadmap update, research note, or other durable output can be stored in GitHub, **push it to GitHub and treat that as sufficient delivery**.

Do **not** send the founder separate download links, duplicate files, or local artifact handoffs unless the founder explicitly asks for them.

For binary artifacts that cannot be conveniently maintained through the GitHub text-file connector in the current environment, preserve the complete source, assumptions, reconstruction notes, or generation specification in the repository so a future developer/agent can recreate them. If a later environment supports committing the binary directly, prefer doing so.

## Communication rule

After successful work, keep the founder-facing update concise:

- what was completed;
- whether it was pushed to GitHub;
- any material blocker or decision required;
- what the next executable task is, when relevant.

Do not repeatedly list downloadable artifacts the founder did not request.

## Continuity rule

A future AI agent or developer should be able to continue Relyo from repository state without needing previous chat history or separately delivered files.
