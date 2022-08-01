# Kick Player

Example scene to kick players

## How to test

Enter the scene and press `F` (_you need to wait for `TIME_BEFORE_NEW_VOTE_MS` [20 by default, see below] seconds to start the vote!_). Than you will see a window, type name of the player like `player#1234` and press `Kick`.

Or you can press `E` and open another voting UI. Mark player you want to kick and press `Select`.

After that all players will see the Voting UI to kick or not the player. Voting lasts for 30 seconds, than if _more than half of players voted_ and the number of `yes` votes greater than number of `no` votes, player will be kicked (teleported to `x: 0, y: 2, z: 0`)

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

You can change the point where kicked player will be teleported - `TELEPORT_KICKED_PLAYER_TO`, specified in the `src/constants/index.ts` file.

Also you can change the time before new voting - `TIME_BEFORE_NEW_VOTE_MS`. It applied both to time after voting and after player entered the scene.

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
