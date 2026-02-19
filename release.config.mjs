/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [ '+([0-9])?(.{+([0-9]),x}).x',
              'main',
              { name: "next", channel: "next", prerelease: "dev"}, 
            ],
  tagFormat: "${version}",
  plugins: [
    "@semantic-release/github",
    [ "@semantic-release/commit-analyzer",
      { 
        "preset": "conventionalcommits",
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        "preset": "conventionalcommits",
      }
    ]
  ],
};