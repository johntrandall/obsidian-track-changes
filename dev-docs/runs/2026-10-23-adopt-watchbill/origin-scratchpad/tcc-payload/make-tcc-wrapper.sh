#!/bin/bash
# make-tcc-wrapper.sh — create a purpose-named TCC principal for a shared interpreter.
#
# WHY: macOS TCC identifies a non-bundled executable by its absolute PATH. Granting
# Accessibility to /opt/homebrew/Cellar/node/26.0.0/bin/node grants it to EVERY node
# process on the machine, and System Settings can only label it "node". Wrapping the
# work in a purpose-named .app bundle gives TCC a bundle identity to key on, so the
# grant is scoped to one job and reads legibly in System Settings.
#
# See: conventions/tcc-principal-identity.md
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  make-tcc-wrapper.sh --purpose <slug> --engine <slug> --exec <path> [options] [-- <args...>]

Required:
  --purpose <slug>   What the job IS, kebab-case.      e.g. messages-mcp, drive-sync
  --engine  <slug>   What actually runs it, kebab-case. e.g. node, python, rclone, bash
  --exec    <path>   Absolute path to the real executable to run.

Options:
  --out <dir>        Where to write the bundle. Default: ~/Applications/TCC Principals
  --id <bundle-id>   Override bundle id. Default: com.johnrandall.<purpose>-<engine>
  --name <display>   Override display name. Default: "<Purpose> (<engine>)"
  --foreground       Show in Dock / allow UI. Default is background-only (LSBackgroundOnly).
  --force            Overwrite an existing bundle at the destination.
  -- <args...>       Everything after `--` is passed to <exec> verbatim, before runtime args.

Example:
  make-tcc-wrapper.sh --purpose screen-automation --engine node \
    --exec /opt/homebrew/bin/node -- /Users/johnrandall/dev/foo/server.js

Produces: ~/Applications/TCC Principals/Screen Automation (node).app
          bundle id com.johnrandall.screen-automation-node
USAGE
}

PURPOSE="" ENGINE="" EXEC="" OUT="$HOME/Applications/TCC Principals"
BUNDLE_ID="" DISPLAY="" BACKGROUND=1 FORCE=0
EXEC_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --purpose)    PURPOSE="${2:?--purpose needs a value}"; shift 2 ;;
    --engine)     ENGINE="${2:?--engine needs a value}"; shift 2 ;;
    --exec)       EXEC="${2:?--exec needs a value}"; shift 2 ;;
    --out)        OUT="${2:?--out needs a value}"; shift 2 ;;
    --id)         BUNDLE_ID="${2:?--id needs a value}"; shift 2 ;;
    --name)       DISPLAY="${2:?--name needs a value}"; shift 2 ;;
    --foreground) BACKGROUND=0; shift ;;
    --force)      FORCE=1; shift ;;
    -h|--help)    usage; exit 0 ;;
    --)           shift; EXEC_ARGS=("$@"); break ;;
    *)            echo "make-tcc-wrapper: unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

[[ -n "$PURPOSE" ]] || { echo "make-tcc-wrapper: --purpose is required" >&2; exit 2; }
[[ -n "$ENGINE"  ]] || { echo "make-tcc-wrapper: --engine is required" >&2; exit 2; }
[[ -n "$EXEC"    ]] || { echo "make-tcc-wrapper: --exec is required" >&2; exit 2; }
[[ -x "$EXEC"    ]] || { echo "make-tcc-wrapper: not executable: $EXEC" >&2; exit 1; }
[[ "$EXEC" = /*  ]] || { echo "make-tcc-wrapper: --exec must be an absolute path (got: $EXEC)" >&2; exit 2; }

# Slug hygiene: TCC principals are permanent-ish; a typo here becomes a permanent
# misleading label in System Settings, which is the exact problem this tool exists to fix.
for pair in "purpose:$PURPOSE" "engine:$ENGINE"; do
  field="${pair%%:*}"; value="${pair#*:}"
  [[ "$value" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || {
    echo "make-tcc-wrapper: --$field must be lowercase kebab-case (got: $value)" >&2; exit 2; }
done

[[ -n "$BUNDLE_ID" ]] || BUNDLE_ID="com.johnrandall.${PURPOSE}-${ENGINE}"
if [[ -z "$DISPLAY" ]]; then
  # "messages-mcp" -> "Messages Mcp" -> title-ish; acronyms are fixed up by --name when it matters.
  pretty="$(echo "$PURPOSE" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')"
  DISPLAY="${pretty} (${ENGINE})"
fi

APP="${OUT}/${DISPLAY}.app"
if [[ -e "$APP" ]]; then
  [[ "$FORCE" -eq 1 ]] || { echo "make-tcc-wrapper: already exists: $APP (use --force)" >&2; exit 1; }
  # Deliberately not `rm -rf` on a user path without --force; with --force this is the target we were told to replace.
  rm -rf "$APP"
fi

mkdir -p "${APP}/Contents/MacOS"

# Stub name mirrors the bundle id's tail so `ps` output is legible too — the same
# lucidity problem shows up in process listings, not just System Settings.
STUB_NAME="${PURPOSE}-${ENGINE}"

{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">'
  echo '<plist version="1.0"><dict>'
  echo "  <key>CFBundleIdentifier</key><string>${BUNDLE_ID}</string>"
  echo "  <key>CFBundleName</key><string>${DISPLAY}</string>"
  echo "  <key>CFBundleDisplayName</key><string>${DISPLAY}</string>"
  echo "  <key>CFBundleExecutable</key><string>${STUB_NAME}</string>"
  echo '  <key>CFBundlePackageType</key><string>APPL</string>'
  echo '  <key>CFBundleInfoDictionaryVersion</key><string>6.0</string>'
  echo '  <key>CFBundleShortVersionString</key><string>1.0</string>'
  [[ "$BACKGROUND" -eq 1 ]] && echo '  <key>LSBackgroundOnly</key><true/>'
  echo '</dict></plist>'
} > "${APP}/Contents/Info.plist"

# The stub MUST be a compiled Mach-O inside Contents/MacOS, and it MUST NOT exec
# the target. Verified 2026-09-24: a shell stub that `exec`s is replaced by the
# target's process image, so TCC sees the interpreter (e.g. "node") and the bundle
# identity is destroyed before it is ever consulted. Spawning the target as a CHILD
# keeps this binary as the process launchd tracks and as the child's responsible
# process, which is what TCC keys on.
SRC="$(mktemp -t tccwrap).c"
STUB="${APP}/Contents/MacOS/${STUB_NAME}"

TCCWRAP_EXEC="$EXEC" python3 - ${EXEC_ARGS[@]+"${EXEC_ARGS[@]}"} > "$SRC" <<'CGEN'
import sys, os
def c(s): return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'
argv = [os.environ["TCCWRAP_EXEC"]] + sys.argv[1:]
print(r"""#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <string.h>
#include <errno.h>
#include <sys/wait.h>

/* Generated by make-tcc-wrapper.sh. Spawns the target as a child and waits;
   deliberately does NOT exec, so this binary stays the responsible process and
   TCC attributes the child's privileged calls to THIS bundle. */

static pid_t child_pid = 0;
static void forward(int sig) { if (child_pid > 0) kill(child_pid, sig); }

int main(int argc, char **argv) {
    static const char *fixed[] = {""" + ", ".join(c(a) for a in argv) + r""", NULL};
    int nfixed = 0; while (fixed[nfixed]) nfixed++;

    char **av = calloc(nfixed + argc + 1, sizeof(char *));
    if (!av) { perror("calloc"); return 127; }
    int i = 0;
    for (; i < nfixed; i++) av[i] = (char *)fixed[i];
    for (int j = 1; j < argc; j++) av[i++] = argv[j];
    av[i] = NULL;

    signal(SIGTERM, forward); signal(SIGINT, forward); signal(SIGHUP, forward);

    child_pid = fork();
    if (child_pid < 0) { perror("fork"); return 127; }
    if (child_pid == 0) { execv(av[0], av); perror("execv"); _exit(127); }

    int st = 0;
    while (waitpid(child_pid, &st, 0) < 0) {
        if (errno != EINTR) { perror("waitpid"); return 127; }
    }
    if (WIFSIGNALED(st)) return 128 + WTERMSIG(st);
    return WEXITSTATUS(st);
}""")
CGEN

cc -O2 -o "$STUB" "$SRC" || { echo "make-tcc-wrapper: failed to compile stub" >&2; rm -f "$SRC"; exit 1; }
rm -f "$SRC"
chmod +x "$STUB"

codesign --force --sign - --identifier "$BUNDLE_ID" "$APP" >/dev/null 2>&1 || {
  echo "make-tcc-wrapper: codesign failed for $APP" >&2; exit 1; }

echo "Created: $APP"
echo "  bundle id : $BUNDLE_ID"
echo "  runs      : $EXEC ${EXEC_ARGS[*]:-}"
codesign -dv "$APP" 2>&1 | grep -E '^(Identifier|Signature)' | sed 's/^/  /'
cat <<NEXT

Next steps (TCC grants cannot be created from the CLI — this is by design):
  1. Point the consumer at the stub instead of the bare interpreter:
       ${STUB}
  2. Run it once so it appears in the relevant System Settings > Privacy pane,
     or add it manually with the "+" button.
  3. Grant ONLY the service this job needs. One change, restart, test
     (see the macos-tcc-fda skill's TCC Change Protocol).
  4. Register it in conventions/tcc-principal-identity.md and in
     setup/macos/tcc-principal-audit/principals.registry, or the audit will flag it
     as unregistered.
NEXT
