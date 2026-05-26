import { access, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { readFile } from "node:fs/promises";

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    args.set(argv[index], argv[index + 1]);
  }
  return args;
}

async function loadEnv(filePath) {
  const content = await readFile(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=");
    }
  }
}

async function firstExistingEnvFile() {
  for (const candidate of [".env.local", ".env"]) {
    const absolutePath = path.resolve(candidate);
    try {
      await access(absolutePath);
      return absolutePath;
    } catch {
      // Try the next conventional env file.
    }
  }

  throw new Error("Missing .env.local or .env in the project root.");
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "inherit",
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8"
    }
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

const args = parseArgs(process.argv.slice(2));
const inputVideo = args.get("--video");

if (!inputVideo) {
  throw new Error("Usage: node scripts/process-video.mjs --video <video-path>");
}

await loadEnv(await firstExistingEnvFile());

const storageDir = process.env.APP_STORAGE_DIR || "./storage";
const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
const modelDir = process.env.FUNASR_MODEL_DIR;

if (!modelDir) {
  throw new Error("Missing FUNASR_MODEL_DIR in env.");
}

const videoPath = path.resolve(inputVideo);
const baseName = path.basename(videoPath, path.extname(videoPath));
const audioDir = path.resolve(storageDir, "audio");
const transcriptDir = path.resolve(storageDir, "transcripts");
const analysisDir = path.resolve(storageDir, "analysis");
const audioPath = path.join(audioDir, `${baseName}.wav`);
const transcriptTextPath = path.join(transcriptDir, `${baseName}.txt`);
const transcriptJsonPath = path.join(transcriptDir, `${baseName}.json`);
const analysisPath = path.join(analysisDir, `${baseName}.analysis.json`);

await mkdir(audioDir, { recursive: true });
await mkdir(transcriptDir, { recursive: true });
await mkdir(analysisDir, { recursive: true });

run(ffmpegPath, [
  "-y",
  "-i",
  videoPath,
  "-vn",
  "-ac",
  "1",
  "-ar",
  "16000",
  "-f",
  "wav",
  audioPath
]);

run("python", [
  "scripts\\transcribe_funasr.py",
  "--model-dir",
  modelDir,
  "--audio",
  audioPath,
  "--out-json",
  transcriptJsonPath,
  "--out-text",
  transcriptTextPath
]);

run("node", [
  "scripts\\analyze-transcript.mjs",
  "--transcript",
  transcriptTextPath,
  "--out",
  analysisPath
]);

console.log(
  JSON.stringify(
    {
      audioPath,
      transcriptTextPath,
      transcriptJsonPath,
      analysisPath
    },
    null,
    2
  )
);
