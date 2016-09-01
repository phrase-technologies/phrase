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
