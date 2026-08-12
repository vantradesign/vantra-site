#!/usr/bin/env bash
# File: scripts/watch_org.sh (in repo vantradesign/vantra-site)
#
# Checks all repos in the vantradesign organization for new repos or new
# commits since the last run. Writes the result to
# state/last-change-payload.json and sets the "changed" output.
#
# Requires: GH_TOKEN (secret ORG_WATCH_TOKEN) with read access to all repos
# in the organization. gh CLI and jq are pre-installed on GitHub-hosted
# runners.

set -euo pipefail

ORG="vantradesign"
STATE_FILE="state/repo-state.json"
PAYLOAD_FILE="state/last-change-payload.json"
CHANGES_TMP="$(mktemp)"

mkdir -p state
[ -f "$STATE_FILE" ] || echo '{}' > "$STATE_FILE"

echo "Fetching repo list for organization ${ORG} ..."
repos_json=$(gh api "orgs/${ORG}/repos" --paginate --jq '[.[] | {name: .name, default_branch: .default_branch}]')

echo "$repos_json" | jq -c '.[]' | while read -r repo; do
  name=$(echo "$repo" | jq -r '.name')
  branch=$(echo "$repo" | jq -r '.default_branch')

  # Skip vantra-site itself to avoid infinite loops
  if [ "$name" = "vantra-site" ]; then
    continue
  fi

  latest_sha=$(gh api "repos/${ORG}/${name}/commits/${branch}" --jq '.sha' 2>/dev/null || echo "")
  if [ -z "$latest_sha" ]; then
    echo "Warning: could not fetch latest commit for ${name}, skipping."
    continue
  fi

  old_sha=$(jq -r --arg n "$name" '.[$n] // ""' "$STATE_FILE")

  status=""
  if [ -z "$old_sha" ]; then
    status="new_repo"
  elif [ "$old_sha" != "$latest_sha" ]; then
    status="updated"
  fi

  if [ -n "$status" ]; then
    echo "${name}|${branch}|${latest_sha}|${old_sha}|${status}" >> "$CHANGES_TMP"
  fi

  jq --arg n "$name" --arg s "$latest_sha" '.[$n] = $s' "$STATE_FILE" > "${STATE_FILE}.tmp"
  mv "${STATE_FILE}.tmp" "$STATE_FILE"
done

if [ -s "$CHANGES_TMP" ]; then
  jq -Rn --arg org "$ORG" '
    {
      org: $org,
      changes: [inputs | select(length > 0) | split("|") | {
        repo: .[0],
        branch: .[1],
        latest_sha: .[2],
        previous_sha: .[3],
        status: .[4]
      }]
    }
  ' "$CHANGES_TMP" > "$PAYLOAD_FILE"

  echo "Changes detected:"
  cat "$PAYLOAD_FILE"
  echo "changed=true" >> "$GITHUB_OUTPUT"
else
  echo "{\"org\": \"${ORG}\", \"changes\": []}" > "$PAYLOAD_FILE"
  echo "No changes detected."
  echo "changed=false" >> "$GITHUB_OUTPUT"
fi

rm -f "$CHANGES_TMP"