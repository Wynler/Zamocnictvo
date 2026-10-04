#!/usr/bin/env bash
# PreToolUse hook pre mcp__Supabase__execute_sql.
# Automaticky povolí len dotazy, ktoré sú čisto na čítanie (SELECT/WITH/EXPLAIN/SHOW
# a neobsahujú žiadne zápisové/mazacie príkazy). Pre všetko ostatné sa necháva
# normálne potvrdzovacie okno (fallback na default permission flow).

input=$(cat)
query=$(printf '%s' "$input" | jq -r '.tool_input.query // ""')

# odstráň SQL komentáre a preveď na malé písmená pre kontrolu kľúčových slov
normalized=$(printf '%s' "$query" | sed -E 's/--[^\n]*//g; s#/\*([^*]|\*[^/])*\*/##g' | tr '[:upper:]' '[:lower:]')
trimmed=$(printf '%s' "$normalized" | sed -E 's/^[[:space:]]+//')

write_keywords='\b(insert|update|delete|drop|alter|truncate|grant|revoke|create|replace|merge|call|copy|vacuum|lock|reindex|comment[[:space:]]+on|into)\b'

if printf '%s' "$normalized" | grep -qE "$write_keywords"; then
  echo '{}'
  exit 0
fi

if printf '%s' "$trimmed" | grep -qE '^(select|with|explain|show)\b'; then
  echo '{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "allow", "permissionDecisionReason": "Auto-schvalene: SQL dotaz je cisto na citanie."}}'
else
  echo '{}'
fi
