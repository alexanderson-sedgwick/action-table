var fs = require("fs"),
	
	pkg = JSON.parse(fs.readFileSync("./package.json")),
	config;

config = {
	"pkg": pkg,
	"eslint": {
		"options": {
			/* http://eslint.org/docs/rules/ */
			"rules": {
				"eqeqeq": 0,
				"curly": [2, "all"],
				"no-undef": 2,
				"semi": 2,
				"indent": [2, "tab", {
						"ignoreComments": true,
						"MemberExpression": 0,
						"SwitchCase": 1
					}
				],
				"comma-dangle": 2,
				"quotes": [2, "double"],
				"no-unused-vars": [1, {
						"varsIgnorePattern": "^(_|[A-Z])",
						"args": "after-used"
					}
				],
				"block-scoped-var": 2,
				"no-undef": 2,
				"max-depth": [1, {
						"max": 10
					}
				]
			},
			"terminateOnCallback": false,
			"envs": ["browser", "jasmine", "es6", "node"],
			"globals": [
				"AbstractAjaxProcessor",
				"GlideRecord",
				"Class",
				"options",
				"data",
				"api",
				"gs",

				"STSTableScriptAPI",

				"sessionStorage",
				"localStorage",
				"FileReader",
				"location",
				"document",
				"angular",
				"Promise",
				"global",
				"window",
				"atob",
				"btoa",
				"$"
			]
		},
		"dist": [
			"providers/**/*.js",
			"scripts/**/*.js",
			"widget/**/*.js"
		]
	},
	"watch": {
		"app": {
			"options": {
				"livereload": {
					"host": "0.0.0.0",
					"port": 3083
				},
				"livereloadOnError": false
			},
			"files": [
				"./providers/**/*.js",
				"./scripts/**/*.js",
				"./widget/**/*.js",
				"./readme.md"
			],
			"tasks": [
				"test",
				"docs"
			]
		}
	},
    "jsdoc" : {
        "dist" : {
            "src": [
				"./providers/",
				"./scripts/",
				"./widget/"
			],
            "options": {
            	"plugins": ["plugins/markdown"],
            	"readme": "./readme.md",
				"private": true,
				// "template" : "./supplementary/documentation/template",
				"template" : "node_modules/ink-docstrap/template",
				"configure" : "node_modules/ink-docstrap/template/jsdoc.conf.json",
                "destination": "documentation"
            }
        }
	},
	"yuidoc": {
		"compile": {
			"name": "<%= pkg.name %>",
			"description": "<%= pkg.description %>",
			"version": "<%= pkg.version %>",
			"url": "<%= pkg.homepage %>",
			"options": {
				"outdir": "./documentation",
				"paths": [
					"./providers/",
					"./scripts/",
					"./widget/"
				]
			}
		}
	}
};

module.exports = function (grunt) {
	require("load-grunt-tasks")(grunt);

	grunt.loadNpmTasks("gruntify-eslint");
	grunt.loadNpmTasks("grunt-contrib-yuidoc");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-jsdoc");

	grunt.initConfig(config);
	// grunt.registerTask("docs", ["yuidoc"]);
	grunt.registerTask("dev", ["watch"]);
	grunt.registerTask("docs", ["jsdoc"]);
	grunt.registerTask("lint", ["eslint"]);
	grunt.registerTask("test", ["lint" /*, Possible future version with component testing */ ]);

	grunt.registerTask("default", ["lint"]);
};
