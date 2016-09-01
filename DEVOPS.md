# Dev Ops
Full recipe for setting up consistent development and production environments is documented here.

## Security and Robustness Requirements
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

## Initial Server Configuration
These steps should only ever have to be run once. Remember to update this doc when changes are implemented.

### Ubuntu
On production/staging environments, use `Ubuntu 16.04`.

### SSH Access
When deploying on DigitalOcean, remember to setup a secondary user instead of just using the root user.
Start by SSH'ing into the server as root:

  ssh root@SERVER_IP_ADDRESS

Create a new OS user account named `phrase`:

  adduser phrase

Record the password here:
https://docs.google.com/a/phrase.fm/spreadsheets/d/16FWt_OTcICjk4RsWUGjZPIM9VAqUdDDObyR7RfmSjLk/edit?usp=sharing
Now, going forward, you can SSH in via the `phrase` user:

  ssh -i ~/.ssh/digital_ocean phrase@SERVER_IP_ADDRESS

Above is the example specifying a specific SSH key if you have multiple. Feel free to setup SSH keys. More info here:
https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-14-04

### RethinkDB
The default RethinkDB installation is not good.
You need to configure it to make it more robust in a continuous deployment scenario.
Please follow carefully below:

#### Installation
Instructions: https://www.rethinkdb.com/docs/install/ubuntu/

#### Configure
Once installed, you need to set it up with 2 requirements:

- Automatically starts upon server reboot
- Automatically load from a hardcoded directory (rather than the dangerous default of just current directory)

You can accomplish this in Ubuntu 16.04 by creating a custom instance config:

  sudo cp /etc/rethinkdb/default.conf.sample /etc/rethinkdb/instances.d/instance1.conf
  sudo vim /etc/rethinkdb/instances.d/instance1.conf
  
Then, hardcode the directory by adding the following line:

  directory=/home/phrase/database
  
Which is equivalent to `~/database`. Now you'll actually have to create the directory,
and set it's privileges so that only RethinkDB has control:

  mkdir ~/database
  sudo chown -R rethinkdb.rethinkdb /home/phrase/database
  
You should now be able to start the database:

  sudo /etc/init.d/rethinkdb restart

Now, install the unofficial RethinkDB CLI interface so you can query stuff.

  npm install -g reql-cli

This is just for sanity checks during devops, try not to use the production DB for reporting queries.
We will setup something for that later.

Sources: official guide: https://www.rethinkdb.com/docs/start-on-startup/

