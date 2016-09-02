# Dev Ops
Full recipe for setting up consistent development and production environments is documented here.
These steps should only ever have to be run once. Remember to update this doc when changes are implemented.

## Requirements and Motivations
Here are the motivations for the architectural decisions in this recipe.

- ☑️ Server configurations are easy and cheap to replicate both locally and remotely - Ubuntu (16+ at time of writing)
- ☑️ Servers are not accessed via root privileges - by default, ssh via a sub user, and sudo only when necessary
- ☑️ Database must automatically start upon server reset (cannot rely on humans remembering)
- ☑️ Database must automatically load from a hardcoded directory (unlike RethinkDB's default configuration, which is to automatically create a blank DB in the current directory. Cannot rely on humans remembering)
- ☑️ Database must automatically backup hourly (cannot rely on humans remembering)
- ☑️ Database migrations must be automatically run upon deployment (cannot rely on humans remembering)
- ☑️ API Responses must automatically be monitored for uptime (cannot rely on humans remembering to check)
- ☑️ API must be on a separate server (non-standard ports are blocked at some places e.g. Ryerson, and merging repos to share same port on same server impractical)
- ☑️ Deployments must be a single step, e.g. abstracted into a single script (cannot rely on humans getting multiple steps correctly)
- ☑️ Deployments must be instant
- ☑️ Deployments must be rollbackable instantly 

At the end of each section below, each critical checkpoint is marked with a ✅.
Make sure each of these checkpoints is met!

## Ubuntu
On production/staging environments, use `Ubuntu 16.04`.

## SSH Access
When deploying a new server, remember to setup a secondary user instead of just using the root user.
Start by SSH'ing into the server as root:

    $ ssh root@SERVER_IP_ADDRESS

Create a new OS user account named `phrase`, and adding them to sudoers:

    $ adduser phrase
    $ gpasswd -a phrase sudo

Record the password here:
[Google Doc](https://docs.google.com/a/phrase.fm/spreadsheets/d/16FWt_OTcICjk4RsWUGjZPIM9VAqUdDDObyR7RfmSjLk/edit?usp=sharing)
Now, going forward, you can SSH in via the `phrase` user:

    $ ssh -i ~/.ssh/your_private_key phrase@SERVER_IP_ADDRESS

Above is the example specifying a specific SSH key if you have multiple. Feel free to setup SSH keys.

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
  
✅ Hard-coded database directory!

Which is equivalent to `~/database`. Now you'll actually have to create the directory,
and set it's privileges so that only RethinkDB has control:

    $ mkdir ~/database
    $ sudo chown -R rethinkdb.rethinkdb /home/phrase/database
  
You should now be able to start the database:

    $ sudo /etc/init.d/rethinkdb restart
    
Now, install the unofficial RethinkDB CLI interface so you can query stuff.
You'll need to install node and npm first, followed by each of the repositories' node modules.
Instead of directly install node, use nvm:

    $ wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.31.6/install.sh | bash
    
See full instructions here: [https://github.com/creationix/nvm](https://github.com/creationix/nvm)
Back to the RethinkDB CLI:


    $ npm install -g reql-cli

This is just for sanity checks during devops, try not to use the production DB for reporting queries.
We will setup something for that later.

Sources: official guide: [https://www.rethinkdb.com/docs/start-on-startup/](https://www.rethinkdb.com/docs/start-on-startup/)

✅ Automatic Database Reboot!

## Codebase
At the end of this, you're expected to have a directory structure that looks like this:

    CLIENT SERVER
    /home
      /phrase
        /phrase-client  -> React/Redux Client

    API SERVER
    /home
      /phrase
        /phrase-api     -> Express API
        /database       -> Rethink Stuff

Git clone this repository (`phrase-api`) and the corresponding `phrase-client` repository.

    $ git clone ...
    
Then, in each repository's folder, install the modules:

    $ npm install

## Deployment

### Initial setup
Linux servers have a security feature that prevents non-root users from binding things
to ports below 1024, meaning the `phrase` user by default won't be able to
deploy the codebase (we want to listen to port 80). There's a handy trick to circumvent this:

    $ sudo apt-get install libcap2-bin
    $ sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``

Source: [http://stackoverflow.com/a/23281417/476426](http://stackoverflow.com/a/23281417/476426)

### Initial Client Build
Now, to deploy to production, we use a different process than the `npm start` that we would use for
the local development environment. Starting with the client. First we build to optimize the 
bundle.js file size:

    $ API_URL='"http://api.phrase.fm"' npm run build

You can check to see if the build is complete by finding the result in `./dist`.
Once the build is ready, you just need to serve it.
Because we want to be able to rejoin the process that is serving the build next time
we ssh into the server, let's use `tmux`:

    $ sudo apt-get install tmux
    $ tmux
    $ cd ~/phrase-client
    $ API_URL='"http://api.phrase.fm"' npm run serve

To detach from `tmux`, do

    CTRL+B, D

To stop the server, next time you ssh into the server, simply rejoin the `tmux` and cancel the process:

    $ tmux attach
    CTRL+C

### Deploying New Client Build
To deploy a new build, you don't have to cancel the process. Simply leave it running,
and repeat the build command with the new codebase,
and the new build will get picked up by the "forever" serving process.

    $ git checkout master
    $ git pull origin master
    $ API_URL='"http://api.phrase.fm"' npm run build

To verify that the new build was picked up by the server, check that it is respawned:

    $ tmux attach
    Check for "Server Started" log

Also, a good sanity check is to simply browse to the site to see that the change appears. 
TODO: Indicate a unique build number, probably the corresponding git commit hash, and indicate it
visibly on the website somewhere.

✅ Instant Client deployment!

### Initial API Build
On the API server, it's the same idea except that there is no separate build process.

    $ tmux
    $ cd ~/phrase-api
    $ CLIENT_URL=phrase.fm npm run start-prod
    Check for "Server started" message

To detach from `tmux`, do

    CTRL+B, D

### Deploying New API Build
Since there is no build process, deploying a new build is as simple as pulling down the new code.
The serving process in the tmux should automatically pick up the new code:

    $ git checkout master
    $ git pull origin master
    $ tmux attach
    Check for "restarting due to changes..." log

✅ Instant API deployment!

Now, make sure that any API endpoints have their corresponding API tests
(at time of writing, using Runscope.com) updated as well!

✅ Automated API Testing!

### Automatic Database Backup
Super important! We'll use cronjobs to take regular backups and regularly clear out old ones.

    $ crontab -e
    
We'll use the `phrase` user that you're logged in with, should be fine.
But be warned that it matters which user the crontab is created for, in debugging.
And then configure it like this:

    # Hourly
      0  *  *  *  *  cd /home/phrase/phrase-api/scripts/backup/ && ./backup-hourly.sh
    
    # Daily at 4:05AM
      5  4  *  *  *  cd /home/phrase/phrase-api/scripts/backup/ && ./backup-daily.sh
    
    # Weekly at Tuesday morning 4:10AM
     10  4  *  *  2  cd /home/phrase/phrase-api/scripts/backup/ && ./backup-weekly.sh
    
    # Monthly, on first day of the Month at 4:15AM
     15  4  1  *  *  cd /home/phrase/phrase-api/scripts/backup/ && ./backup-monthly.sh
    
    <<<<<<<< REMEMBER TO LEAVE A NEWLINE AT THE END OF THE CRONTAB!

Test the scripts out by running them directly.
They might need a Rethink python driver installed to work:

    sudo pip install rethinkdb
    
Source: [https://www.rethinkdb.com/docs/install-drivers/python/](https://www.rethinkdb.com/docs/install-drivers/python/)
Make sure the crontab is working by checking after an hour.

✅ Automatic Database Backup!


### Migratations (TODO)
TODO: Automigration checks.
Next person who writes a migration must build the automigration feature.

☑️ Automatic Database Migration (TODO)


### Automatic Client/API Reboot (TODO)
We need to make sure that in the event the server(s) get rebooted,
the builds are automatically served upon system startup, to minimize human error and downtime.

TODO: [http://stackoverflow.com/questions/4681067/how-do-i-run-a-node-js-application-as-its-own-process](http://stackoverflow.com/questions/4681067/how-do-i-run-a-node-js-application-as-its-own-process)

☑️ Automatic Client/API Reboot (TODO)
