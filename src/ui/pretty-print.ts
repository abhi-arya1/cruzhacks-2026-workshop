// This file is solely to make the demo look nicer, and does not change functionality

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",

  // Foreground
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Background
  bgCyan: "\x1b[46m",
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
};

export function printHeader(text: string) {
  const line = "═".repeat(text.length + 4);
  console.log(`\n${colors.cyan}╔${line}╗${colors.reset}`);
  console.log(
    `${colors.cyan}║${colors.reset}  ${colors.bold}${colors.white}${text}${colors.reset}  ${colors.cyan}║${colors.reset}`,
  );
  console.log(`${colors.cyan}╚${line}╝${colors.reset}\n`);
}

export function printQuery(query: string) {
  console.log(`${colors.yellow}${colors.bold}Query:${colors.reset} ${query}\n`);
}

export function printSearching(query: string) {
  console.log(`${colors.dim}Searching for \"${query}\"...${colors.reset}\n`);
}

export function printSearchComplete() {
  console.log(`${colors.dim}Finished search...${colors.reset}\n`);
}

export function printSources(sources: { id: string; similarity: number }[]) {
  console.log(`${colors.magenta}${colors.bold}Sources:${colors.reset}`);
  for (const { id, similarity } of sources) {
    const clampedScore = Math.max(0, Math.min(1, similarity));
    const scorePercent = (clampedScore * 100).toFixed(1);
    const filled = Math.round(clampedScore * 20);
    const bar = "█".repeat(filled) + "░".repeat(20 - filled);
    console.log(
      `  ${colors.gray}├─${colors.reset} ${colors.blue}${id}${colors.reset}`,
    );
    console.log(
      `  ${colors.gray}│  ${colors.green}${bar}${colors.reset} ${colors.dim}${scorePercent}%${colors.reset}`,
    );
  }
  console.log();
}

export function printAnswer(answer: string) {
  console.log(`${colors.green}${colors.bold}Answer:${colors.reset}`);
  console.log(`${colors.white}${answer}${colors.reset}\n`);
}

export function printDivider() {
  console.log(`${colors.gray}${"─".repeat(60)}${colors.reset}\n`);
}

export function printError(error: string) {
  console.log(`${colors.yellow}${colors.bold}Error:${colors.reset} ${error}\n`);
}
