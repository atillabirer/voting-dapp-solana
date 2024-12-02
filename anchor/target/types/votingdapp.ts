/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/votingdapp.json`.
 */
export type Votingdapp = {
  "address": "FPzzmxm38cjWpiCQzHwF1Gb6stPPxGXGqiA6RZ8WAGNn",
  "metadata": {
    "name": "votingdapp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeElection",
      "docs": [
        "Initializes the election with a name, description, start time, and candidates."
      ],
      "discriminator": [
        59,
        166,
        191,
        126,
        195,
        0,
        153,
        168
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The signer who will become the admin of the election."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "election",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "startTime",
          "type": "u64"
        },
        {
          "name": "endTime",
          "type": "u64"
        },
        {
          "name": "candidateNames",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "vote",
      "docs": [
        "Casts a vote for a candidate by ID."
      ],
      "discriminator": [
        227,
        110,
        155,
        23,
        136,
        126,
        172,
        25
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "election",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "candidateId",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "election",
      "discriminator": [
        68,
        191,
        164,
        85,
        35,
        105,
        152,
        202
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "electionAlreadyInitialized",
      "msg": "Election has already been initialized."
    },
    {
      "code": 6001,
      "name": "votingNotStarted",
      "msg": "Voting has not started yet."
    },
    {
      "code": 6002,
      "name": "votingEnded",
      "msg": "Voting has ended."
    },
    {
      "code": 6003,
      "name": "candidateNotFound",
      "msg": "Candidate not found."
    },
    {
      "code": 6004,
      "name": "unauthorizedAdmin",
      "msg": "Unauthorized admin action."
    },
    {
      "code": 6005,
      "name": "alreadyVoted",
      "msg": "You have already voted."
    }
  ],
  "types": [
    {
      "name": "candidate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u16"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "voters",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "election",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "endTime",
            "type": "u64"
          },
          {
            "name": "candidates",
            "type": {
              "vec": {
                "defined": {
                  "name": "candidate"
                }
              }
            }
          },
          {
            "name": "voters",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    }
  ]
};
