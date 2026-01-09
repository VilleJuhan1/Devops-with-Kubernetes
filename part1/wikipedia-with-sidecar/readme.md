# Wikipedia page presenter app

This app, or more a deployment, serves a random Wikipedia page from an nginx pod every 5 to 15 minutes. The server is always initialized with the Wikipedia Kubernetes page by the init container and then afterwards the new page is added to the shared storage by the sidecar container.
