import { execSync } from "child_process";

// first two args can be ignored rest will be passed directly to the npm command
const [ingore, ignore2, ...args] = process.argv;

// windowsHide option will hide the cmd window
execSync(`yarn ${args.join(" ")}`, { windowsHide: true, stdio: "inherit" });
