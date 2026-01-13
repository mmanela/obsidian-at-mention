import { MarkdownView, Notice, parseLinktext, Plugin, TAbstractFile, TFile } from 'obsidian';

export default class AtMentionLinkerPlugin extends Plugin {
	private aliasMap: Map<string, string> = new Map();
	private fileKeyMap: Map<string, Set<string>> = new Map();
	private isProcessing = false;

	async onload() {
		await this.buildInitialAliasMap();

		// Auto run on file modification (save)
		this.registerEvent(
			this.app.vault.on("modify", (file) => this.onFileModify(file))
		);

		// Manual command
		this.addCommand({
			id: "run-on-active-file",
			name: "Convert @mentions to links in active file",
			callback: () => this.runOnActiveFile(),
		});

		// Keep aliasMap in sync with vault changes
		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => this.updateAliasEntriesForFile(file))
		);
		this.registerEvent(
			this.app.vault.on("delete", (file) => {
				if (file instanceof TFile) {
					this.removeAliasEntriesForFile(file);
				}
			})
		);
		this.registerEvent(
			this.app.vault.on("rename", (file, oldPath) => {
				if (file instanceof TFile) {
					this.updateAliasEntriesForFile(file);
				}
			})
		);
	}

	onunload() {
		// Cleanup is handled automatically by Obsidian
	}

	private async buildInitialAliasMap() {
		const { vault } = this.app;

		for (const file of vault.getMarkdownFiles()) {
			this.addOrUpdateFileAliases(file);
		}
	}

	private updateAliasEntriesForFile(file: TFile) {
		if (file.extension !== "md") return;
		this.removeAliasEntriesForFile(file);
		this.addOrUpdateFileAliases(file);
	}

	private removeAliasEntriesForFile(file: TFile) {
		const keys = this.fileKeyMap.get(file.path);
		if (!keys) return;

		for (const key of keys) {
			this.aliasMap.delete(key);
		}
		this.fileKeyMap.delete(file.path);
	}

	private addOrUpdateFileAliases(file: TFile) {
		const { metadataCache } = this.app;
		const cache = metadataCache.getFileCache(file);
		const fm = cache?.frontmatter;

		const canonical = file.basename;
		const canonicalKey = canonical.toLowerCase();
		const keys = new Set<string>();

		// Always map the filename itself
		this.aliasMap.set(canonicalKey, canonical);
		keys.add(canonicalKey);

		if (fm) {
			const possibleAliases = [fm.alias, fm.aliases].filter((v) => v != null);

			for (const entry of possibleAliases) {
				if (!entry) continue;

				if (Array.isArray(entry)) {
					for (const item of entry) {
						if (typeof item === "string") {
							const trimmed = item.trim();
							if (trimmed) {
								const key = trimmed.toLowerCase();
								this.aliasMap.set(key, canonical);
								keys.add(key);
							}
						}
					}
				} else if (typeof entry === "string") {
					const trimmed = entry.trim();
					if (trimmed) {
						const key = trimmed.toLowerCase();
						this.aliasMap.set(key, canonical);
						keys.add(key);
					}
				}
			}
		}

		this.fileKeyMap.set(file.path, keys);
	}

	private onFileModify(file: TAbstractFile) {
		// Prevent infinite loop from our own modifications
		if (this.isProcessing) return;
		
		if (!(file instanceof TFile)) return;
		
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || view.file?.path !== file.path) return;
		
		this.processFile(view);
	}

	private runOnActiveFile() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;
		this.processFile(view);
	}

	private processFile(view: MarkdownView) {
		const editor = view.editor;
		const originalText = editor.getValue();

		const mentionRegex = /@([A-Za-z0-9 _-]+)/g;
		let changed = false;

		const replacedText = originalText.replace(mentionRegex, (fullMatch, rawName: string) => {
			if (typeof rawName !== "string") return fullMatch;
			
			const normalized = rawName.trim();
			if (!normalized) return fullMatch;

			// Use parseLinktext to handle any special characters
			const { path } = parseLinktext(normalized);

			// First try Obsidian's own link resolution
			const sourcePath = view.file?.path ?? "";
			const dest = this.app.metadataCache.getFirstLinkpathDest(path, sourcePath);

			let canonical: string | undefined;

			if (dest) {
				canonical = dest.basename;
			} else {
				// Fallback to alias map
				const key = normalized.toLowerCase();
				canonical = this.aliasMap.get(key);
			}

			if (canonical) {
				changed = true;
				return `[[${canonical}]]`;
			}

			return fullMatch;
		});

		if (changed) {
			// Set flag to prevent infinite loop
			this.isProcessing = true;
			editor.setValue(replacedText);
			this.isProcessing = false;
			new Notice("Converted @mentions to links");
		}
	}
}
