# Mafia the Game

This is fully decentralized version of the classic Mafia game that doesn't need any server to run.

## How to play

There is a table on the scene. To participate Mafia, click on this table.

When the number of participants will be greater then 4, the game will be started:

Firstly, you will get your role (an icon of it will be displayed at right bottom corner)

After getting roles the night is coming and mafia can select a victim to kill. If you're a mafia, a window for selecting the victim will be showed for you. Mark the player you want to kill with a checkbox and click on **"Select"**.

After 15 seconds player that gains most votes will be killed and the day will come. _If more than 1 player have the same number of votes, no one will be killed._

A day voting is similar to night voting except everyone can participate. Select player that you think is mafia in a 15 seconds and wait for results. _Unlike to mafia's voting, in day voting if more than 1 player got the same number of votes, one of them will be killed (randomly)._

If all the mafia are dead, civilians win.
But if the number of the mafia will be greater than the number of civilians, the mafia win.

**Note:** All killed players will be moved to corner of the scene `(x: 0, y: 0, z: 0)`

## Kick Player

Enter the scene and press `F` (_you need to wait for (`TIME_BEFORE_NEW_VOTE_MS`) [20 by default, see below] seconds to start the vote!_). Then you will see a window, type name of the player like player#1234 and press Kick.

After that, all users will see the Voting UI to kick or not the player. Voting lasts for 30 seconds, then if more than half of users voted and the number of yes votes greater than the number of no votes, player will be kicked (teleported to x: 0, y: 0, z: 0)
**Note:** you cannot vote against yourself!
**Note:** you cannot start more the one voting at the same time!
**Note:** you cannot start the voting against players that doesn't exist on the scene!

## Try it out locally

**Install the CLI**

Download and install the Decentraland CLI by running the following command:

```bash
npm i -g decentraland
```

**Previewing the scene**

Open this folder on the command line, then run:

```
dcl start
```

Any dependencies are installed and then the CLI opens the scene in a new browser tab.

## Customizing

You can change some parameters of the game, specified in the `src/constants/index.ts` file. For example, you can change the minimum number of participants to play (`MIN_PLAYER_COUNT`) or update formula for determining the mafia roles number (`MAFIA_FORMULA`).

Also you can adjust duration of game phases (`GAME_PHASES_DURATION_MS`, `WAIT_BEFORE_START_MS` and `WAIT_BEFORE_VOTING_RESULTS`) or specify the point to teleport the player after they were killed (`TELEPORT_KILLED_PLAYER_TO`).

Finally you may want to remove displaying the player's role (`SHOW_ROLE_ICON`) or current phase label (`SHOW_PHASE_LABEL`) at the bottom right corner of the screen.

You can change the point where kicked player will be teleported – `⁣TELEPORT_KICKED_PLAYER_TO`, specified in the `src/constants/index.ts` file.

You can change the time before new voting – `⁣TIME_BEFORE_NEW_VOTE_MS`. It applied both to time after voting and after the player entered the scene.

To change the voting duration, adjust `VOTING_DURATION_MS`.

## Deploy to Decentraland

If you own any parcels of land in Decentraland, or have permissions to deploy to someone else's, you can publish this project.

1. Make sure the scene parcels in `scene.json` match those you own or have permissions on.
2. Run `dcl deploy` on the project folder
3. This will open a browser tab to confirm. Metamask will prompt you to sign.
   > Note: Make sure you are using the wallet that owns the parcels or has permissions.

### Deploy to a free server

If you don't own parcels in Decentraland or are not ready to publish your scene to the world, you can share your creations by uploading your scenes to a free hosting service.

See [Upload a preview](https://docs.decentraland.org/development-guide/deploy-to-now/) for instructions on how to do this.
