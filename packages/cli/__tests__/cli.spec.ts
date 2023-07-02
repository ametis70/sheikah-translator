import fs from "node:fs/promises";
import fsSync from "node:fs"
import path from "node:path";
import os from "node:os";

import { stdout, stderr } from "stdout-stderr";

import { getTempSaveDir } from '@sheikah-converter/test'

import { CLI } from "../src";
import { getSaveType, SaveType } from "@sheikah-converter/lib";

let wiiUDir: string;
let switchDir: string;


describe("botwc CLI", () => {
  beforeAll(async () => {
    wiiUDir = await getTempSaveDir('wiiu')
    switchDir = await getTempSaveDir('switch')
  })

  afterAll(async () => {
    await fs.rm(wiiUDir, { recursive: true });
    await fs.rm(switchDir, { recursive: true });
  })


  beforeEach(() => {
    stdout.start();
    stderr.start();
  });

  afterEach(() => {
    stdout.stop();
    stderr.stop();
  });

  it("Should fail if no input directory is provided", async () => {
    expect(CLI.run([])).rejects.toThrow();
  });

  it("Should convert and copy the new files correctly", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const originalOptionFile = await fs.readFile(path.resolve(wiiUDir, "option.sav"));

    const { type: originalType } = getSaveType(originalOptionFile);

    expect(originalType).toBe(SaveType.WiiU);

    await CLI.run([wiiUDir, outDir]);

    const convertedOptionFile = await fs.readFile(path.resolve(outDir, "option.sav"));

    const { type: convertedType } = getSaveType(convertedOptionFile);

    expect(convertedType).toBe(SaveType.Switch);

    expect(fsSync.existsSync(path.resolve(outDir, "0", "game_data.sav"))).toBe(true);
    expect(fsSync.existsSync(path.resolve(outDir, "0", "caption.sav"))).toBe(true);
    expect(fsSync.existsSync(path.resolve(outDir, "tracker", "trackblock00.sav"))).toBe(true);
    expect(stdout.output).toEqual("Finished!\n")
  });

  it("Should print more information when verbose output is enabled", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    await CLI.run([wiiUDir, outDir, '-v']);

    const lines = stdout.output.split("\n")

    expect(lines.splice(lines.findIndex(l => l === "Verbose output enabled"), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Using existing empty dir "${outDir}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Found Wii U save file (v1.5) in ${path.resolve(wiiUDir, "0", "game_data.sav")}`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Found Wii U save file (v1.5) in ${path.resolve(wiiUDir, "0", "caption.sav")}`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Found Wii U option file (v1.5) in ${path.resolve(wiiUDir, "option.sav")}`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Creating directory "${path.resolve(outDir, "0")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Creating directory "${path.resolve(outDir, "tracker")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Converting "${path.resolve(wiiUDir, "option.sav")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Writing "${path.resolve(wiiUDir, "option.sav")}" to "${path.resolve(outDir, "option.sav")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Copying "${path.resolve(wiiUDir, "0", "caption.jpg")}" to "${path.resolve(outDir, "0", "caption.jpg")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `File "${path.resolve(wiiUDir, "0", "caption.jpg")}" does not exist"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Converting "${path.resolve(wiiUDir, "0", "caption.sav")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Writing "${path.resolve(wiiUDir, "0", "caption.sav")}" to "${path.resolve(outDir, "0", "caption.sav")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Converting "${path.resolve(wiiUDir, "tracker", "trackblock00.sav")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Writing "${path.resolve(wiiUDir, "tracker", "trackblock00.sav")}" to "${path.resolve(outDir, "tracker", "trackblock00.sav")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Converting "${path.resolve(wiiUDir, "0", "game_data.sav")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Writing "${path.resolve(wiiUDir, "0", "game_data.sav")}" to "${path.resolve(outDir, "0", "game_data.sav")}"`), 1)).toBeTruthy();
    expect(lines.splice(lines.findIndex(l => l === `Finished!`), 1)).toBeTruthy();
  });
});
