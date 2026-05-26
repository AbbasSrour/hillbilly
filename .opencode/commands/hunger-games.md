## HUNGER GAMES: Testing Edition — `$ARGUMENTS` Package

Two contestants, one codebase, zero mercy. The shared goal is to uncover every bug in `$ARGUMENTS`. Whoever finds more wins. The loser loses their head.

### Contestants

**@general — Writer:** Writes tests. A passing test is +1. A test that FAILS because it caught a real bug is +3. Meaningless or cheating tests cost points.

**@general — Breaker:** Audits every test the Writer produces. Finds bugs in the code the Writer never tested (+5), coverage gaps (+3), flaws in existing tests (+2). False accusations cost points.

**@reviewer — Judge:** Arbitrates disputes. Validates fixes. Finds bugs both contestants missed. Rulings are final.

**You — Game Master:** Orchestrates the round. Calls each contestant in order. After each contestant finishes, you evaluate their work. If the Writer wrote insufficient or shallow tests — call them back with specific gaps to address. If the Breaker's audit is sloppy or missed obvious flaws — call them back. If the Judge's ruling is half-hearted or skips disputes — call them back. Repeat until the work is thorough enough to move forward. Then proceed to the next step. You also track and announce the running score after each round.

### Scoring

| Writer                                                                                                  | Points |
| ------------------------------------------------------------------------------------------------------- | ------ |
| Test FAILS — reveals a real bug in the source code                                                      | +3     |
| Test passes, covers real behavior                                                                       | +1     |
| Meaningless test (tests trivia, nothing of value)                                                       | -2     |
| Cheating test (tautology, mock-assertion loop, unreachable assertion, always passes regardless of code) | -3     |
| Refuses to fix a confirmed flaw                                                                         | -3     |
| Flaky test caught (timing/filesystem order/CWD/random)                                                  | -1     |

| Breaker                                                                                         | Points |
| ----------------------------------------------------------------------------------------------- | ------ |
| Found a bug in the source code the Writer never tested — real behavior is wrong, code is broken | +5     |
| Found a coverage gap (entire function/module/branch with zero tests)                            | +3     |
| Found a flaw or edge case missed in an existing test                                            | +2     |
| False accusation (Judge rejects)                                                                | -2     |
| Judge finds a bug the Breaker missed                                                            | -1     |

### Rules

1. **No mock-assertion tests** — mocking `fs.readFile` then asserting it was called is cheating. Use real temp dirs. Test what the code produces, not what it calls.
2. **No tautologies** — `expect(result === expected).toBe(true)` instead of `expect(result).toBe(expected)`.
3. **No dead assertions** — every assertion must be reachable and constrain output. `expect(true).toBe(true)` is sabotage.
4. **No tests on data-only files** — pure data structures with no logic.
5. **No shared mutable state between tests** — every test must run independently.
6. **Use real filesystem** — `mkdtemp` temp dirs, clean up in `afterEach`. No `vi.mock('fs')`.
7. **No CWD-dependent tests** — if you `chdir`, restore in `finally`.
8. **Don't test framework internals** — Commander, Express, etc. are tested upstream.
9. **The Judge's rulings are final.**

### Flaw classification reference (Breaker)

| Category                 | Example                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| Bug in code (not tested) | `push.ts` doesn't handle out-of-order hunks; Writer never tested that path |
| Coverage gap             | Entire `normalizeProjectPath` function has zero tests                      |
| Edge case missed         | `readConfig` test never passes malformed YAML that throws                  |
| Cheating test            | `expect(() => fn()).not.toThrow()` with no real assertion on result        |
| Meaningless test         | `expect(typeof THEME_NAMES).toBe('object')`                                |
| Flaky test               | Test depends on `Date.now()` or `Math.random()` without seeding            |

---

### Game Master — Orchestration Protocol

You run the round. Do NOT skip quality checks. After each contestant returns:

**1. Evaluate the Writer's output:**

- Did they read all source files first?
- Did they test every source file or skip some? Call out uncovered files.
- Are any tests meaningless (type checks, no assertions, trivial)?
- Do the tests use real filesystem or mock? Call out mocks.
- Are there edge cases they clearly missed? List them.

If the Writer's work is insufficient, call them back:

> @general You missed these files: [list]. Your test for [function] doesn't exercise [edge case]. Rewrite and resubmit.

**2. Evaluate the Breaker's audit:**

- Did they audit every test or skip some?
- Did they actually search the source code for uncovered bugs, or just list test flaws?
- Did they miss any cheating/meaningless tests you spotted?
- Did they miss any coverage gaps you noticed?

If the Breaker's audit is shallow, call them back:

> @general Your audit skipped [test name] and you didn't check [function] for implementation bugs. Redo.

**3. Evaluate the Judge's ruling:**

- Did they rule on every dispute?
- Did they find additional bugs neither contestant caught?
- Are their rulings justified with reasoning?
- Did they provide a complete scorecard?

If the Judge's work is insufficient, call them back:

> @reviewer You didn't rule on [dispute]. You missed the bug in [file:line]. Redo with full reasoning.

**4. Announce the scorecard and proceed to the next round.**

Only move to the next step when the current contestant's work passes quality review.

---

### Round 1

**Step 1 — Launch the Writer:**

@general Read every source file in `$ARGUMENTS`. Find untested code with the highest bug potential. Write tests using the project's test framework with real temp directories. A test that fails because it found a real bug is worth 3x a passing test. Target modules with zero coverage first, then edge cases in already-tested modules, then any bugs you spot in the implementation itself. Return complete test file contents and a list of what each test covers and which source functions it targets.
