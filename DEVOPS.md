# Dev Ops
Full recipe for setting up consistent development and production environments is documented here.
These steps should only ever have to be run once. Remember to update this doc when changes are implemented.

## Requirements and Motivations
Here are the motivations for the architectural decisions in this recipe.

- Server configurations are easy and cheap to replicate both locally and remotely - Ubuntu (16+ at time of writing)
- Servers are not accessed via root privileges - by default, ssh via a sub user, and sudo only when necessary
- Database must automatically start upon server reset (cannot rely on humans remembering)
- Database must automatically load from a hardcoded directory (unlike RethinkDB's default configuration, which is to automatically create a blank DB in the current directory. Cannot rely on humans remembering)
- Database must automatically backup hourly (cannot rely on humans remembering)
- Database migrations must be automatically run upon deployment (cannot rely on humans remembering)
- API Responses must automatically be monitored for uptime (cannot rely on humans remembering to check)
- API must be on a separate server (non-standard ports are blocked at some places e.g. Ryerson, and merging repos to share same port on same server impractical)
- Deployments must be a single step, e.g. abstracted into a single script (cannot rely on humans getting multiple steps correctly)
- Deployments must be instant
- Deployments must be rollbackable instantly 

## Ubuntu
On production/staging environments, use `Ubuntu 16.04`.

## SSH Access
When deploying on DigitalOcean, remember to setup a secondary user instead of just using the root user.
Start by SSH'ing into the server as root:

    $ ssh root@SERVER_IP_ADDRESS

Create a new OS user account named `phrase`:

    $ adduser phrase

Record the password here:
[Google Doc](https://docs.google.com/a/phrase.fm/spreadsheets/d/16FWt_OTcICjk4RsWUGjZPIM9VAqUdDDObyR7RfmSjLk/edit?usp=sharing)
Now, going forward, you can SSH in via the `phrase` user:

    $ ssh -i ~/.ssh/digital_ocean phrase@SERVER_IP_ADDRESS

Above is the example specifying a specific SSH key if you have multiple. Feel free to setup SSH keys. More info here:
[https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-14-04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-14-04)

## RethinkDB
The default RethinkDB installation is not good.
You need to configure it to make it more robust in a continuous deployment scenario.
Please follow carefully below:

### Installation
Instructions: [https://www.rethinkdb.com/docs/install/ubuntu/](https://www.rethinkdb.com/docs/install/ubuntu/)

### Configure
Once installed, you need to set it up with 2 requirements:

- Automatically starts upon server reboot
- Automatically load from a hardcoded directory (rather than the dangerous default of just current directory)

You can accomplish this in Ubuntu 16.04 by creating a custom instance config:

    $ sudo cp /etc/rethinkdb/default.conf.sample /etc/rethinkdb/instances.d/instance1.conf
    $ sudo vim /etc/rethinkdb/instances.d/instance1.conf
  
Then, hardcode the directory by adding the following line:

    directory=/home/phrase/database
  
Which is equivalent to `~/database`. Now you'll actually have to create the directory,
and set it's privileges so that only RethinkDB has control:

    $ mkdir ~/database
    $ sudo chown -R rethinkdb.rethinkdb /home/phrase/database
  
You should now be able to start the database:

    $ sudo /etc/init.d/rethinkdb restart

Now, install the unofficial RethinkDB CLI interface so you can query stuff.
(You might need to install node/npm first)

    $ npm install -g reql-cli

This is just for sanity checks during devops, try not to use the production DB for reporting queries.
We will setup something for that later.

Sources: official guide: [https://www.rethinkdb.com/docs/start-on-startup/](https://www.rethinkdb.com/docs/start-on-startup/)

## Codebase
At the end of this, you're expected to have a director structure that looks like this:

   /home
     /phrase
       /phrase-client  -> React/Redux Client
       /phrase-api     -> Express API
       /database       -> Rethink Stuff

Git clone this repository (`phrase-api`) and the corresponding `phrase-client` repository.

    $ git clone ...
    
You'll now have to install node and npm, followed by each of the repositories' node modules.
Instead of directly install node, use nvm:

    $ wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.31.6/install.sh | bash
    
See full instructions here: [https://github.com/creationix/nvm](https://github.com/creationix/nvm)
Then, in each repository's folder, install the modules:

    $ cd phrase-client
    $ npm install
    $ cd ../phrase-api
    $ npm install

## Deployment
Linux servers have a security feature that prevents non-root users from binding things
to ports below 1024, meaning the `phrase` user by default won't be able to
deploy the codebase (we want to listen to port 80). There's a handy trick to circumvent this:

    $ sudo apt-get install libcap2-bin
    $ sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``

Source: [http://stackoverflow.com/a/23281417/476426](http://stackoverflow.com/a/23281417/476426)

Next, we need `nodemon` which is a wrapper around node that watches for file changes.

    $ npm install -g nodemon

Now, to deploy to production, we use a different process than the `npm start` that we would use for
the local development environment. Starting with the client. First we build to optimize the 
bundle.js file size:

    $ API_URL='"http://api.phrase.fm"' npm run build

You can check to see if the build is complete by finding the result in `./dist`.
Once the build is ready, you just need to serve it.
Because we want to be able to rejoin the process that is serving the build next time
we ssh into the server, let's use tmux:

    $ tmux
    $ API_URL='"http://api.phrase.fm"' npm run serve

To stop the server, next time you ssh into the server, simply rejoin the tmux and cancel the process:

    $ tmux attach
    CTRL+C

To deploy a new build, you don't have to cancel the process. Simply leave it running,
and repeat the build command, and the new build will get picked up by the "forever" serving process.

    $ API_URL='"http://api.phrase.fm"' npm run build


TODO:
- Separate API server
- Automigration checks
- 
