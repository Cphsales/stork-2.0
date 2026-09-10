#!/usr/bin/env python3
# exec-tracer.py — selvtest-infrastruktur (F-3h, Codex P2 runde 10f): kør en kommando under ptrace og log hvert execve i HELE
# procestræet som kernen ser det (pid · /proc/<pid>/exe · argv). Uafhængigt af fixtures og af wrapperens egen kvittering —
# beviser fx at ingen native/shim/node startes før pins. Kun exec-/fork-events traces (ingen syscall-trace) → ~30 ms overhead.
# Brug: exec-tracer.py <logfil> -- <kommando> [args…]   (exit-status = kommandoens; død ved signal videreføres som samme signal)
import ctypes, os, sys, signal
libc = ctypes.CDLL(None, use_errno=True)
libc.ptrace.restype = ctypes.c_long
libc.ptrace.argtypes = [ctypes.c_long, ctypes.c_long, ctypes.c_void_p, ctypes.c_void_p]
PTRACE_TRACEME, PTRACE_CONT, PTRACE_SETOPTIONS, PTRACE_GETEVENTMSG = 0, 7, 0x4200, 0x4201
O_TRACEFORK, O_TRACEVFORK, O_TRACECLONE, O_TRACEEXEC, O_EXITKILL = 2, 4, 8, 0x10, 0x100000
EV_FORK, EV_VFORK, EV_CLONE, EV_EXEC = 1, 2, 3, 4
OPTS = O_TRACEFORK | O_TRACEVFORK | O_TRACECLONE | O_TRACEEXEC | O_EXITKILL
log_path = sys.argv[1]; assert sys.argv[2] == "--"; cmd = sys.argv[3:]
log = open(log_path, "a", buffering=1)
def logexec(pid):
    try: exe = os.readlink(f"/proc/{pid}/exe")
    except OSError: exe = "?"
    try: argv = open(f"/proc/{pid}/cmdline", "rb").read().split(b"\0")[:-1]
    except OSError: argv = []
    log.write("EXEC %d %s %s\n" % (pid, exe, " ".join(a.decode("utf-8", "replace").replace("\n", "\\n") for a in argv[:8])))
root = os.fork()
if root == 0:
    libc.ptrace(PTRACE_TRACEME, 0, None, None)
    os.execvp(cmd[0], cmd)   # stopper m. SIGTRAP ved exec
# forælder
root_status = None; tracees = {root}; opts_set = set()
while tracees:
    try: pid, status = os.waitpid(-1, 0x40000000)  # __WALL
    except ChildProcessError: break
    if os.WIFEXITED(status) or os.WIFSIGNALED(status):
        tracees.discard(pid)
        if pid == root: root_status = status
        continue
    if not os.WIFSTOPPED(status): continue
    sig = os.WSTOPSIG(status); event = status >> 16
    if pid not in opts_set:
        libc.ptrace(PTRACE_SETOPTIONS, pid, None, ctypes.c_void_p(OPTS)); opts_set.add(pid)
        if pid == root and sig == signal.SIGTRAP and event == 0: logexec(pid)   # første exec (før options)
    if event == EV_EXEC:
        logexec(pid); libc.ptrace(PTRACE_CONT, pid, None, None); continue
    if event in (EV_FORK, EV_VFORK, EV_CLONE):
        new = ctypes.c_ulong(0); libc.ptrace(PTRACE_GETEVENTMSG, pid, None, ctypes.byref(new)); tracees.add(new.value)
        libc.ptrace(PTRACE_CONT, pid, None, None); continue
    if event != 0:
        libc.ptrace(PTRACE_CONT, pid, None, None); continue
    # signal-stop: nye tracees starter m. SIGSTOP (undertrykkes); SIGTRAP fra første exec undertrykkes; andre leveres
    deliver = 0 if sig in (signal.SIGSTOP, signal.SIGTRAP) else sig
    libc.ptrace(PTRACE_CONT, pid, None, ctypes.c_void_p(deliver))
log.close()
if root_status is None: sys.exit(1)
if os.WIFSIGNALED(root_status): os.kill(os.getpid(), os.WTERMSIG(root_status))
sys.exit(os.WEXITSTATUS(root_status))
