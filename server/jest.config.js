module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	moduleFileExtensions: ["ts", "js", "json"],
	testMatch: ["**/?(*.)+(spec|test).ts"],
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
	},
};
