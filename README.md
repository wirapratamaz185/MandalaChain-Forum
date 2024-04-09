## **Run Project**
```sh
yarn dev
```
This should run the project on `localhost:3000`

# **Running via Docker**
You can build and run the application through Docker. This requires the `.env.local` file to be completed, refer to 
installation instructions in the [Wiki](https://github.com/mbeps/next_discussion_platform/wiki/3.-Installation#step-32-obtain-firebase-secrets-and-add-them-to-the-envlocal-file) for setting it up.

Once everything is ready, use the command bellow to run the application. 
```sh
docker-compose -f docker/docker-compose.yml up --build
```
