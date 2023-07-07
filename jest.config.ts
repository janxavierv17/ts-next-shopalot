module.exports = {
	testEnvironment: "jsdom",
	roots: ["<rootDir>/app"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	testMatch: [
		"**/__tests__/**/*.+(ts|tsx|js|jsx)",
		"**/?(*.)+(spec|test).+(ts|tsx|js|jsx)",
	],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
};
