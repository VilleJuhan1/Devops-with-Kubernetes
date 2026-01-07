# Notes

These notes are gathered from the [Devops with Kubernetes MOOC course material](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes) and the related documentation. _All rights are on the original authors._

## [Chapter 2 - Kubernetes Basics](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-2)

### [Part 1: First deploy](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-2/first-deploy)

_Learning goals:_

- _Create and run a Kubernetes cluster locally with k3d_
- _Deploy a simple application to Kubernetes_

#### k3d cluster commands

```shell
k3d cluster create -a 2
docker ps
kubectl cluster-info
k3d cluster stop
k3d cluster delete
```

#### Deploying a container to the cluster

```shell
kubectl create deployment hashgenerator-dep --image=jakousa/dwk-app1
kubectl explain pod
kubectl get pods
kubectl get deployments
kubectl logs -f hashgenerator-dep-6965c5c7-2pkxc
```

#### Declarative configuration with YAML

```shell
kubectl scale deployment/hashgenerator-dep --replicas=4
kubectl set image deployment/hashgenerator-dep dwk-app1=jakousa/dwk-app1:b7fc18de2376da80ff0cfc72cf581a9f94d10e64
kubectl delete deployment hashgenerator-dep
```

Create a folder called manifests and create deployment.yaml, ie.

```shell
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hashgenerator-dep
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hashgenerator
  template:
    metadata:
      labels:
        app: hashgenerator
    spec:
      containers:
        - name: hashgenerator
          image: jakousa/dwk-app1:b7fc18de2376da80ff0cfc72cf581a9f94d10e64
```

_The created file looks a lot like the docker-compose.yaml files we have previously written. Let's ignore what we don't know for now, which is mainly labels, and focus on the things that we know:_

- _kind: Deployment declares what kind, or type the created object has_
- _name: hashgenerator-dep gives a name as metadata_
- _replicas: 1 declaring that there should be one pod to run the containers_
- _We're also declaring that it has a container that is from a certain image with a name_

Apply the deployment:

```shell
kubectl apply -f manifests/deployment.yaml
  deployment.apps/hashgenerator-dep created
```

Delete and create it again from a URL:

```shell
kubectl delete -f manifests/deployment.yaml
  deployment.apps "hashgenerator-dep" deleted

kubectl apply -f https://raw.githubusercontent.com/kubernetes-hy/material-example/master/app1/manifests/deployment.yaml
  deployment.apps/hashgenerator-dep created
```

Comparing docker and kubectl commands: [Docker-cli into kubectl commands](https://kubernetes.io/docs/reference/kubectl/docker-cli-to-kubectl/)

Deployment workflow (for now, will be adjusted in the future):

```shell
docker build -t <image>:<new_tag>
docker push <image>:<new_tag>
```

Modify the deployment file:

```shell
kubectl apply -f manifests/deployment.yaml
```

### [Part 2: Introduction to Debugging](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-2/introduction-to-debugging)

_Learning goals:_

- _Strategies for debugging when something doesn't work_
- _How to use Lens to explore Kubernetes resources_

Useful tools for debugging:

#### [kubectl describe](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_describe/)

```shell
# Describe a node
kubectl describe nodes kubernetes-node-emt8.c.myproject.internal

# Describe a pod
kubectl describe pods/nginx

# Describe a pod identified by type and name in "pod.json"
kubectl describe -f pod.json

# Describe all pods
kubectl describe pods

# Describe pods by label name=myLabel
kubectl describe pods -l name=myLabel

# Describe all pods managed by the 'frontend' replication controller
# (rc-created pods get the name of the rc as a prefix in the pod name)
kubectl describe pods frontend
```

#### [kubectl logs](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/)

```shell
# Syntax
kubectl logs [-f] [-p] (POD | TYPE/NAME) [-c CONTAINER]

# Return snapshot logs from pod nginx with only one container
kubectl logs nginx

# Return snapshot logs from pod nginx, prefixing each line with the source pod and container name
kubectl logs nginx --prefix

# Return snapshot logs from pod nginx, limiting output to 500 bytes
kubectl logs nginx --limit-bytes=500

# Return snapshot logs from pod nginx, waiting up to 20 seconds for it to start running.
kubectl logs nginx --pod-running-timeout=20s

# Return snapshot logs from pod nginx with multi containers
kubectl logs nginx --all-containers=true

# Return snapshot logs from all pods in the deployment nginx
kubectl logs deployment/nginx --all-pods=true

# Return snapshot logs from all containers in pods defined by label app=nginx
kubectl logs -l app=nginx --all-containers=true

# Return snapshot logs from all pods defined by label app=nginx, limiting concurrent log requests to 10 pods
kubectl logs -l app=nginx --max-log-requests=10

# Return snapshot of previous terminated ruby container logs from pod web-1
kubectl logs -p -c ruby web-1

# Begin streaming the logs from pod nginx, continuing even if errors occur
kubectl logs nginx -f --ignore-errors=true

# Begin streaming the logs of the ruby container in pod web-1
kubectl logs -f -c ruby web-1

# Begin streaming the logs from all containers in pods defined by label app=nginx
kubectl logs -f -l app=nginx --all-containers=true

# Display only the most recent 20 lines of output in pod nginx
kubectl logs --tail=20 nginx

# Show all logs from pod nginx written in the last hour
kubectl logs --since=1h nginx

# Show all logs with timestamps from pod nginx starting from August 30, 2024, at 06:00:00 UTC
kubectl logs nginx --since-time=2024-08-30T06:00:00Z --timestamps=true

# Show logs from a kubelet with an expired serving certificate
kubectl logs --insecure-skip-tls-verify-backend nginx

# Return snapshot logs from first container of a job named hello
kubectl logs job/hello

# Return snapshot logs from container nginx-1 of a deployment named nginx
kubectl logs deployment/nginx -c nginx-1
```

#### [kubectl delete](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_delete/)

```shell
# Syntax
kubectl delete ([-f FILENAME] | [-k DIRECTORY] | TYPE [(NAME | -l label | --all)])

# Delete a pod using the type and name specified in pod.json
kubectl delete -f ./pod.json

# Delete resources from a directory containing kustomization.yaml - e.g. dir/kustomization.yaml
kubectl delete -k dir

# Delete resources from all files that end with '.json'
kubectl delete -f '*.json'

# Delete a pod based on the type and name in the JSON passed into stdin
cat pod.json | kubectl delete -f -

# Delete pods and services with same names "baz" and "foo"
kubectl delete pod,service baz foo

# Delete pods and services with label name=myLabel
kubectl delete pods,services -l name=myLabel

# Delete a pod with minimal delay
kubectl delete pod foo --now

# Force delete a pod on a dead node
kubectl delete pod foo --force

# Delete all pods
kubectl delete pods --all

# Delete all pods only if the user confirms the deletion
kubectl delete pods --all --interactive
```

#### Describe

- [Lens - Powertool for Kubernetes observability](https://lenshq.io)
- [Getting started](https://docs.k8slens.dev/k8slens/getting-started/)

Inspecting a deployment.

```shell
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes-hy/material-example/master/app1/manifests/deployment.yaml
  deployment.apps/hashgenerator-dep created

$ kubectl describe deployment hashgenerator-dep
  Name:                   hashgenerator-dep
  Namespace:              default
  CreationTimestamp:      Thu, 20 Mar 2025 13:59:42 +0200
  Labels:                 <none>
  Annotations:            deployment.kubernetes.io/revision: 1
  Selector:               app=hashgenerator
  Replicas:               1 desired | 1 updated | 1 total | 1 available | 0 unavailable
  StrategyType:           RollingUpdate
  MinReadySeconds:        0
  RollingUpdateStrategy:  25% max unavailable, 25% max surge
  Pod Template:
    Labels:  app=hashgenerator
    Containers:
     hashgenerator:
      Image:        jakousa/dwk-app1:b7fc18de2376da80ff0cfc72cf581a9f94d10e64
      Port:         <none>
      Host Port:    <none>
      Environment:  <none>
      Mounts:       <none>
    Volumes:        <none>
  Conditions:
    Type           Status  Reason
    ----           ------  ------
    Available      True    MinimumReplicasAvailable
    Progressing    True    NewReplicaSetAvailable
  OldReplicaSets:  <none>
  NewReplicaSet:   hashgenerator-dep-75bdcc94c (1/1 replicas created)
  Events:
    Type    Reason             Age    From                   Message
    ----    ------             ----   ----                   -------
    Normal  ScalingReplicaSet  8m39s  deployment-controller  Scaled up replica set hashgenerator-dep-75bdcc94c to 1
```

Inspecting a pod.

```shell
$ kubectl describe pod hashgenerator-dep-75bdcc94c-whwsm
  ...
  Events:
    Type    Reason     Age   From                              Message
    ----    ------     ----  ----                              -------
    Normal  Scheduled  26s   default-scheduler  Successfully assigned default/hashgenerator-dep-7877df98df-qmck9 to k3d-k3s-default-server-0
    Normal  Pulling    15m   kubelet            Pulling image "jakousa/dwk-app1:b7fc18de2376da80ff0cfc72cf581a9f94d10e64"
    Normal  Pulled     26s   kubelet            Container image "jakousa/dwk-app1:b7fc18de2376da80ff0cfc72cf581a9f94d10e64"
    Normal  Created    26s   kubelet            Created container hashgenerator
    Normal  Started    26s   kubelet            Started container hashgenerator
```

Reviewing logs (Use -f for follow).

```shell
$ kubectl logs hashgenerator-dep-75bdcc94c-whwsm
  jst944
  3c2xas
  s6ufaj
  cq7ka6
```

### [Part 3: Introduction to Networking](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-2/introduction-to-networking)

Configuring port-forwarding (not for production use, but useful for debugging)

```shell
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes-hy/material-example/master/app2/manifests/deployment.yaml
  deployment.apps/hashresponse-dep created

$ kubectl get pods
  NAME                                READY   STATUS    RESTARTS   AGE
  hashgenerator-dep-5cbbf97d5-z2ct9   1/1     Running   0          20h
  hashresponse-dep-57bcc888d7-dj5vk   1/1     Running   0          19h

$ kubectl port-forward hashresponse-dep-57bcc888d7-dj5vk 3003:3000
  Forwarding from 127.0.0.1:3003 -> 3000
  Forwarding from [::1]:3003 -> 3000
```

[Setting up environmental variables](https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/)

```shell
apiVersion: v1
kind: Pod
metadata:
  name: envar-demo
  labels:
    purpose: demonstrate-envars
spec:
  containers:
  - name: envar-demo-container
    image: gcr.io/google-samples/hello-app:2.0
    env:
    - name: DEMO_GREETING
      value: "Hello from the environment"
    - name: DEMO_FAREWELL
      value: "Such a sweet sorrow"
```

_K3d [documentation](https://k3d.io/v5.3.0/usage/commands/k3d_cluster_create/) tells us how the ports are opened, we'll open local 8081 to 80 in k3d-k3s-default-serverlb and local 8082 to 30080 in k3d-k3s-default-agent-0. The 30080 is chosen almost completely randomly, but needs to be a value between 30000-32767 for the next step:_

```shell
$ k3d cluster delete
  INFO[0000] Deleting cluster 'k3s-default'
  ...
  INFO[0002] Successfully deleted cluster k3s-default!

$ k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
  INFO[0000] Created network 'k3d-k3s-default'
  ...
  INFO[0021] Cluster 'k3s-default' created successfully!
  INFO[0021] You can now use it like this:
  kubectl cluster-info

$ kubectl apply -f https://raw.githubusercontent.com/kubernetes-hy/material-example/master/app2/manifests/deployment.yaml
  deployment.apps/hashresponse-dep created
```

#### Services

_[Service](https://kubernetes.io/docs/concepts/services-networking/service/) resources are essential for managing the application's accessibility, ensuring that it can be reached by connections originating both outside the cluster and from within. These resources handle the routing and load balancing necessary to maintain seamless communication with the application, regardless of the dynamic nature of pod creation and termination._

Creating a service for the hashresponse deployment:

```shell
apiVersion: v1
kind: Service
metadata:
  name: hashresponse-svc
spec:
  type: NodePort
  selector:
    app: hashresponse # This is the app as declared in the deployment.
  ports:
    - name: http
      nodePort: 30080 # This is the port that is available outside. Value for nodePort can be between 30000-32767
      protocol: TCP
      port: 1234 # This is a port that is available to the cluster, in this case it can be ~ anything
      targetPort: 3000 # This is the target port
```

```shell
$ kubectl apply -f manifests/service.yaml
  service/hashresponse-svc created
```

_As we've published 8082 as 30080 we can access it now via http://localhost:8082. We've now defined a nodeport with type: NodePort. [NodePorts](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport) are simply ports that are opened by Kubernetes to all of the nodes and the service will handle requests in that port. NodePorts are not flexible and require you to assign a different port for every application. As such NodePorts are not used in production but are helpful to know about._

#### Ingress

While services work on Transport layer (L4), Ingresses work on Application (L7) layer, check [OSI model](https://en.wikipedia.org/wiki/OSI_model) for more details. _Ingresses are implemented by various different "controllers". This means that ingresses do not automatically work in a cluster, but give you the freedom of choosing which Ingress controller works for you the best. K3s has [Traefik](https://containo.us/traefik/) installed already._

Creating an Ingress resource:

```shell
$ kubectl delete -f manifests/service.yaml
  service "hashresponse-svc" deleted
```

\_A [ClusterIP](https://kubernetes.io/docs/concepts/services-networking/service/#type-clusterip) type Service resource gives the Service an internal IP that'll be accessible within the cluster.

The following service.yaml definition will let TCP traffic from port 2345 to port 3000:\_

```shell
apiVersion: v1
kind: Service
metadata:
  name: hashresponse-svc
spec:
  type: ClusterIP
  selector:
    app: hashresponse
  ports:
    - port: 2345
      protocol: TCP
      targetPort: 3000
```

Creating the new ingress:

```shell
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dwk-material-ingress
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: hashresponse-svc
            port:
              number: 2345
```

Apply and view the results:

```shell
$ kubectl apply -f manifests
  ingress.networking.k8s.io/dwk-material-ingress created
  service/hashresponse-svc configured

$ kubectl get svc,ing
  NAME                       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)    AGE
  service/kubernetes         ClusterIP   10.43.0.1    <none>        443/TCP    5m22s
  service/hashresponse-svc   ClusterIP   10.43.0.61   <none>        2345/TCP   45s

  NAME                                             CLASS    HOSTS   ADDRESS                            PORTS   AGE
  ingress.networking.k8s.io/dwk-material-ingress   <none>   *       172.21.0.3,172.21.0.4,172.21.0.5   80      16s
```

The end result is that we should be able to access the application on localhost port 8081, which we defined while creating the cluster.

Deleting deployments, services etc. that are not necessary anymore (in this case log-output):

```shell
kubectl get deployments
kubectl get services
kubectl delete service log-output-web-svc
kubectl get ingress
kubectl delete ingress log-output-ingress
kubectl cluster-info
docker ps
```

Creating a shared ingress, more info on ingresses [here](https://kubernetes.io/docs/concepts/services-networking/ingress/):

```shell
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: simple-fanout-example
spec:
  rules:
  - host: foo.bar.com
    http:
      paths:
      - path: /foo
        pathType: Prefix
        backend:
          service:
            name: service1
            port:
              number: 4200
      - path: /bar
        pathType: Prefix
        backend:
          service:
            name: service2
            port:
              number: 8080
```

### [Part 4: Introduction to Storage](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-2/introduction-to-storage)

Shared deployment with shared emptyDir volume (persists through restarts but disappears after pods go down):

```shell
apiVersion: apps/v1
kind: Deployment
metadata:
  name: images-dep
spec:
  replicas: 1
  selector:
    matchLabels:
      app: images
  template:
    metadata:
      labels:
        app: images
    spec:
      volumes: # Define volume
        - name: shared-image
          emptyDir: {}
      containers:
        - name: image-finder
          image: jakousa/dwk-app3-image-finder:b7fc18de2376da80ff0cfc72cf581a9f94d10e64
          volumeMounts: # Mount volume
          - name: shared-image
            mountPath: /usr/src/app/files
        - name: image-response
          image: jakousa/dwk-app3-image-response:b7fc18de2376da80ff0cfc72cf581a9f94d10e64
          volumeMounts: # Mount volume
          - name: shared-image
            mountPath: /usr/src/app/files
```

#### Persistent volume

Example persistentvolume.yaml

```shell
apiVersion: v1
kind: PersistentVolume
metadata:
  name: example-pv
spec:
  storageClassName: my-example-pv # this is the name you are using later to claim this volume
  capacity:
    storage: 1Gi # Could be e.q. 500Gi. Small amount is to preserve space when testing locally
  volumeMode: Filesystem # This declares that it will be mounted into pods as a directory
  accessModes:
  - ReadWriteOnce
  local:
    path: /tmp/kube
  nodeAffinity: ## This is only required for local, it defines which nodes can access it
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values:
          - k3d-k3s-default-agent-0
```

To use persistent volume, a pod needs to claim it using a persistent volume claim, ie. persistenvolumeclaim.yaml

```shell
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: image-claim # name of the volume claim, this will be used in the deployment
spec:
  storageClassName: my-example-pv # this is the name of the persistent volume we are claiming
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

Also the pod deployment must be configured to use the PVC

```shell
# ...
    spec:
      volumes:
        - name: shared-image
          persistentVolumeClaim:
            claimName: image-claim
      containers:
        - name: image-finder
          image: jakousa/dwk-app3-image-finder:b7fc18de2376da80ff0cfc72cf581a9f94d10e64
          volumeMounts:
          - name: shared-image # PVC name
            mountPath: /usr/src/app/files
        - name: image-response
          image: jakousa/dwk-app3-image-response:b7fc18de2376da80ff0cfc72cf581a9f94d10e64
          volumeMounts:
          - name: shared-image # PVC name
            mountPath: /usr/src/app/files
```

## [Chapter 3 - More building blocks](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-3)

### [Part 1: Networking between pods](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-3/networking-between-pods)

Sometimes, the best way to debug is to manually test what is going on. You can just go inside a pod or send a request manually from another pod. You can use eg. busybox (opens in a new tab) (opens in a new tab), that is a light weight Linux distro for debugging.

Let us start a busybox pod by applying the following yaml:

```shell
apiVersion: v1
kind: Pod
metadata:
  name: my-busybox
  labels:
    app: my-busybox
spec:
  containers:
  - image: busybox
    command:
      - sleep
      - "3600"
    imagePullPolicy: IfNotPresent
    name: busybox
  restartPolicy: Always
```

```shell
$ kubectl exec -it my-busybox -- wget -qO - http://todo-backend-svc:2345
```

```shell
$ kubectl exec -it my-busybox -- sh
/ # wget -qO - http://todo-backend-svc:2345
<!DOCTYPE html>
<html lang="en">
<head>
</head>
<body>
  <main>
    <div>
      <h1>The project App</h1>
      <img src="image" alt="Kubeapp" width="300" />
      <form action="/todos" method="post">
        <input type="text" id="content" name="content" maxlength="140" required>
        <button type="submit">Create todo</button>
      </form>
      <ul>
          <li>Learn JavaScript</li>
          <li>Learn React</li>
          <li>Build a project</li>
      </ul>
      <p>DevOps with Kubernetes 2025</p>
    </div>
  </main>
  </body>
$ exit
```

```shell
$ kubectl get svc
NAME               TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
todo-backend-svc   ClusterIP   10.43.89.182   <none>        2345/TCP   2d1h

$ kubectl exec -it my-busybox -- wget -qO - http://10.43.89.182:2345

$ kubectl describe pod todo-backend-dep-84fcdff4cc-2x9wl
Name:             todo-backend-dep-84fcdff4cc-2x9wl
Namespace:        default
Priority:         0
Service Account:  default
Node:             k3d-k3s-default-agent-0/192.168.176.5
Start Time:       Mon, 08 Apr 2024 23:27:00 +0300
Labels:           app=todo-backend
                  pod-template-hash=84fcdff4cc
Annotations:      <none>
Status:           Running
IP:               10.42.0.63

$ kubectl exec -it my-busybox wget -qO - http://10.42.0.63:3000
```

Remember to delete the pod in the end as it's not a deployment and should not be running forever:

```shell
$ kubectl delete pod/my-busybox
```

### [Part 2: Organizing a Cluster](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-3/organizing-a-cluster)

Namespaces are used to keep resources separated. A company that uses one cluster but has multiple projects can use namespaces to split the cluster into virtual clusters, one for each project. Most commonly they would be used to separate environments such as production, testing, staging. DNS entry for services includes the namespace so you can still have projects communicate with each other if needed through service.namespace address. e.g. if a service called cat-pictures is in a namespace ns-test, it could be found from other namespaces via http://cat-pictures.ns-test.

Accessing namespaces with kubectl is achieved by using the -n flag. For example, you can see what the namespace kube-system has with

```shell
kubectl get pods -n kube-system
```

All namespaces:

```shell
kubectl get pods --all-namespaces
NAMESPACE     NAME                                      READY   STATUS      RESTARTS   AGE
default       log-output-deployment-6d698d8755-qppqf    2/2     Running     0          6d20h
default       ping-pong-deployment-75cfc5994-jcqth      1/1     Running     0          6d20h
default       to-do-backend-69d4fc8687-g6lvh            1/1     Running     0          2d5h
default       to-do-frontend-65fb4b7c4b-nkqr6           1/1     Running     0          2d5h
kube-system   coredns-64fd4b4794-przj4                  1/1     Running     0          6d20h
kube-system   helm-install-traefik-crd-d4qcv            0/1     Completed   0          6d20h
kube-system   helm-install-traefik-m9k75                0/1     Completed   2          6d20h
kube-system   local-path-provisioner-774c6665dc-j8545   1/1     Running     0          6d20h
kube-system   metrics-server-7bfffcd44-r7s7m            1/1     Running     0          6d20h
kube-system   svclb-traefik-4b650fcb-b2xj9              2/2     Running     0          6d20h
kube-system   svclb-traefik-4b650fcb-qbtw7              2/2     Running     0          6d20h
kube-system   svclb-traefik-4b650fcb-zh5sn              2/2     Running     0          6d20h
kube-system   traefik-c98fdf6fb-xg2hq                   1/1     Running     0          6d20h
```

Creating a namespace

```shell
kubectl create namespace example-namespace
```

Defining the namespace on a deployment

```shell
# ...
metadata:
  namespace: example-namespace
  name: example
# ...
```

Changing the current default context

```shell
kubectl config set-context --current --namespace=<name>
```

#### Kubectx and kubens tools

```shell
# switch to another cluster that's in kubeconfig
$ kubectx minikube
Switched to context "minikube".

# switch back to previous cluster
$ kubectx -
Switched to context "oregon".

# rename context
$ kubectx dublin=gke_ahmetb_europe-west1-b_dublin
Context "gke_ahmetb_europe-west1-b_dublin" renamed to "dublin".

# change the active namespace on kubectl
$ kubens kube-system
Context "test" set.
Active namespace is "kube-system".

# go back to the previous namespace
$ kubens -
Context "test" set.
Active namespace is "default".

# change the active namespace even if it doesn't exist
$ kubens not-found-namespace --force
Context "test" set.
Active namespace is "not-found-namespace".
---
$ kubens not-found-namespace -f
Context "test" set.
Active namespace is "not-found-namespace".
```

Creating a namespace via a deployment

```shell
> test.yaml

kind: Namespace
apiVersion: v1
metadata:
  name: test
  labels:
    name: test

> kubectl apply -f test.yaml
```

Getting all namespaces

```shell
kubectl get namespaces
```

Add to the deployment file:

```shell
namespace: test
```

#### Labels

Labels can help us humans identify resources and Kubernetes can use them to act upon a group of resources. You can query resources that have a certain label.

```shell
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hashgenerator-dep
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hashgenerator
  template:
    metadata:
      labels:
        app: hashgenerator
    spec:
      containers:
        - name: hashgenerator
          image: jakousa/dwk-app1:b7fc18de2376da80ff0cfc72cf581a9f94d10e64
```

Adding a label manually

```shell
$ kubectl label po hashgenerator-dep-7b9b88f8bf-lvcv4 importance=great
  pod/hashgenerator-dep-7b9b88f8bf-lvcv4 labeled
```

Query with a label

```shell
$ kubectl get pod -l importance=great
  NAME                                 READY   STATUS    RESTARTS   AGE
  hashgenerator-dep-7b9b88f8bf-lvcv4   1/1     Running   0          17m
```

Deciding on which node to run using label networkquality: excellent

```shell
    ...
    spec:
      containers:
        - name: hashgenerator
          image: jakousa/dwk-app1:b7fc18de2376da80ff0cfc72cf581a9f94d10e64
      nodeSelector:
        networkquality: excellent
```

Labelling a node manually

```shell
$ kubectl label nodes k3d-k3s-default-agent-1 networkquality=excellent
  node/k3d-k3s-default-agent-1 labeled

$ kubectl get pods
  NAME                                 READY   STATUS    RESTARTS   AGE
  hashgenerator-dep-7b9b88f8bf-mktcl   1/1     Running   0          5m30s
```

### [Part 3: Configuring applications](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-3/configuring-applications)

Kubernetes has two resources for configuration management. [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) are for sensitive information that are given to containers on runtime. [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) are quite much like secrets but they may contain any kind of configurations. Use cases for ConfigMaps vary: you may have a ConfigMap mapped to a file with some values that the server reads during runtime. Changing the ConfigMap will instantly change the behavior of the application. Both can also be used to introduce environment variables.

#### Secrets

Example app deployment

```shell
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes-hy/material-example/master/app4/manifests/deployment.yaml \
                -f https://raw.githubusercontent.com/kubernetes-hy/material-example/master/app4/manifests/ingress.yaml \
                -f https://raw.githubusercontent.com/kubernetes-hy/material-example/master/app4/manifests/service.yaml
```

deployment.yaml

```shell
# ...
containers:
  - name: imageagain
    envFrom:
      - secretRef:
          name: pixabay-apikey
```

longer version with a dedicated ENV name

```shell
# ...
containers:
  - name: imageagain
    env:
      - name: API_KEY # ENV name passed to container
        valueFrom:
          secretKeyRef:
            name: pixabay-apikey
            key: API_KEY # ENV name in the secret
```

Application won't run before we assign a value for the secret

```shell
$ kubectl describe pod imageapi-dep-6cdd4879f7-zwlbr
Name:             imageapi-dep-6cdd4879f7-zwlbr
Status:           Pending
IP:               10.42.0.89

...

Events:
  Type     Reason     Age     From       Message
  ----     ------     ----    ----       -------
  Warning  Failed     21m     kubelet    Error: secret "pixabay-apikey" not found
  Normal   Pulled     3m15s   kubelet    Container image "jakousa/dwk-app4:b7fc18de2376da80ff0cfc72cf581a9f94d10e64" already present on machine
```

Let's create secret.yaml

```shell
apiVersion: v1
kind: Secret
metadata:
  name: pixabay-apikey
data:
  API_KEY: aHR0cDovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PWRRdzR3OVdnWGNR
  # base64 encoded value should look something like this, note that this won't work
  # create your own apikey if you would like to test the app
```

Create the key

```shell
$ echo -n 'my-string' | base64
bXktc3RyaW5n
```

We will now use [SOPS](https://github.com/mozilla/sops) to encrypt the secret.yaml file. The tool has some additional flexibility, so I hope you get some use out of it, regardless of the environment you will be working in the future. For example, you could use it with Docker Compose files. We will use [age](https://github.com/FiloSottile/age) for encryption because it's recommended over PGP in the Readme. So install both of the tools, SOPS and age.

Then create a key-pair

```shell
$ age-keygen -o key.txt
  Public key: age17mgq9ygh23q0cr00mjn0dfn8msak0apdy0ymjv5k50qzy75zmfkqzjdam4

$ sops --encrypt \
       --age age17mgq9ygh23q0cr00mjn0dfn8msak0apdy0ymjv5k50qzy75zmfkqzjdam4 \
       --encrypted-regex '^(data)$' \
       secret.yaml > secret.enc.yaml

$ cat secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: pixabay-apikey
data:
  API_KEY: ENC[AES256_GCM,data:geKXBLn4kZ9A2KHnFk4RCeRRnUZn0DjtyxPSAVCtHzoh8r6YsCUX3KiYmeuaYixHv3DRKHXTyjg=,iv:Lk290gWZnUGr8ygLGoKLaEJ3pzGBySyFJFG/AjwfkJI=,tag:BOSX7xJ/E07mXz9ZFLCT2Q==,type:str]
sops:
  kms: []
  gcp_kms: []
  azure_kv: []
  hc_vault: []
  age:
    - recipient: age17mgq9ygh23q0cr00mjn0dfn8msak0apdy0ymjv5k50qzy75zmfkqzjdam4
      enc: |
        -----BEGIN AGE ENCRYPTED FILE-----
        YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IFgyNTUxOSBDczBhbGNxUkc4R0U0SWZI
        OEVYTEdzNUlVMEY3WnR6aVJ6OEpGeCtJQ1hVCjVSbDBRUnhLQjZYblQ0UHlneDIv
        UmswM2xKUWxRMHZZQjVJU21UbDNEb3MKLS0tIGhOMy9lQWx4Q0FUdVhoVlZQMjZz
        dDEreFAvV3Nqc3lIRWh3RGRUczBzdXcKh7S4q8qp5SrDXLQHZTpYlG43vLfBlqcZ
        BypI8yEuu18rCjl3HJ+9jbB0mrzp60ld6yojUnaggzEaVaCPSH/BMA==
        -----END AGE ENCRYPTED FILE-----
  lastmodified: "2021-10-29T12:20:40Z"
  mac: ENC[AES256_GCM,data:qhOMGFCDBXWhuildW81qTni1bnaBBsYo7UHlv2PfQf8yVrdXDtg7GylX9KslGvK22/9xxa2dtlDG7cIrYFpYQPAh/WpOzzn9R26nuTwvZ6RscgFzHCR7yIqJexZJJszC5yd3w5RArKR4XpciTeG53ygb+ng6qKdsQsvb9nQeBxk=,iv:PZLF3Y+OhtLo+/M0C0hqINM/p5K94tb5ZGc/OG8loJI=,tag:ziFOjWuAW/7kSA5tyAbgNg==,type:str]
  pgp: []
  encrypted_regex: ^(data)$
  version: 3.7.1
```

Decrypting

```shell
$ export SOPS_AGE_KEY_FILE=$(pwd)/key.txt

$ sops --decrypt secret.enc.yaml > secret.yaml
```

You can also apply a secret yaml via piping directly, this helps avoid creating a plain secret.yaml file.

```shell
$ sops --decrypt secret.enc.yaml | kubectl apply -f -
```

More commands

```shell
# Create the keypair using age and save it to user folder
age-keygen -o ~/.config/sops/age/keys.txt

# Create the .sops.yaml used for ENCRYPTING using the created Public key
creation_rules:
  - encrypted_regex: "^(data|stringData)$"
    age: age12hlqsxnr76q884zjhzh3up3x9jpf939k29fu3vdmy5fxyhklcfmqs00g4x

# Encrypt the secret-file
sops -e -i manifests/postgres-secret.yaml

# Decrypt the secret-file only for deployment via pipe
sops -d manifests/postgres-secret.yaml | kubectl apply -f -

# Export the master key file for editing
export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt

# Edit the file (ie. update password)
sops ./manifests/postgres-secret.yaml

# Optional: You can also use a one-liner
SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt sops ./manifests/postgres-secret.yaml

```

#### ConfigMaps

[ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) are similar but the data doesn't have to be encoded and is not encrypted. Let's say you have a videogame server that takes a configuration file serverconfig.txt which looks like this:

```shell
maxplayers=12
difficulty=2
```

As a ConfigMap

```shell
apiVersion: v1
kind: ConfigMap
metadata:
  name: example-configmap
data:
  serverconfig.txt: |
    maxplayers=12
    difficulty=2
```

Now the ConfigMap can be added to the container as a _volume_. By changing a value, like "maxplayers" in this case, and applying the ConfigMap the changes would be reflected in that volume.

From the official [documentation](https://kubernetes.io/docs/concepts/configuration/configmap/)

```shell
apiVersion: v1
kind: ConfigMap
metadata:
  name: game-demo
data:
  # property-like keys; each key maps to a simple value
  player_initial_lives: "3"
  ui_properties_file_name: "user-interface.properties"

  # file-like keys
  game.properties: |
    enemy.types=aliens,monsters
    player.maximum-lives=5
  user-interface.properties: |
    color.good=purple
    color.bad=yellow
    allow.textmode=true
```

There are four different ways that you can use a ConfigMap to configure a container inside a Pod:

- Inside a container command and args
- Environment variables for a container
- Add a file in read-only volume, for the application to read
- Write code to run inside the Pod that uses the Kubernetes API to read a ConfigMap

Using a ConfigMap as a volume

```shell
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - name: mypod
    image: redis
    volumeMounts:
    - name: foo
      mountPath: "/etc/foo"
      readOnly: true
  volumes:
  - name: foo
    configMap:
      name: myconfigmap
```

### [Part 4: StatefulSets and Jobs](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-3/statefulsets-and-jobs)

What you'll learn in this page

- Deploy a stateful application, such as a database, to Kubernetes
- Use jobs and cronjobs to execute periodic or single-time tasks

#### StatefulSets

Deployment creates and scales pods that are replicas - they are new copies of the same container that are running in parallel. So the volume is shared by all pods in that deployment. For read-only volumes, this is ok, but for volumes that have read-write access, this might cause problems and can in the worst case, cause even data corruption.

[StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) are similar to Deployments except they make sure that if a pod dies, the replacement is identical, with the same network identity and name. In addition, if the pod is scaled, each copy will have its own storage. So, StatefulSets are for stateful applications, where the state is stored inside the app, not outside, such as in a database. StatefulSets are ideal for scaling applications that require persistent state, such as video game servers (e.g., Minecraft servers) or databases. One key advantage of using StatefulSets is that they ensure data safety by not deleting the associated volumes when the StatefulSet is deleted.

Example with Redis

```shell
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: redis-svc
  labels:
    app: redis
spec:
  ports:
  - port: 6379
    name: web
  clusterIP: None
  selector:
    app: redisapp
```

```shell
# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-stset
spec:
  serviceName: redis-svc
  replicas: 2
  selector:
    matchLabels:
      app: redisapp
  template:
    metadata:
      labels:
        app: redisapp
    spec:
      containers:
        - name: redisfiller
          image: jakousa/dwk-app5:54203329200143875187753026f4e93a1305ae26
        - name: redis
          image: redis:5.0
          ports:
            - name: web
              containerPort: 6379
          volumeMounts:
            - name: redis-data-storage
              mountPath: /data
  volumeClaimTemplates:
    - metadata:
        name: redis-data-storage
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: local-path
        resources:
          requests:
            storage: 100Mi
```

The stateful set looks a lot like a Deployment but uses a volumeClaimTemplate to claim its own volume for each pod. In Chapter 2 we jumped through a few hurdles to get ourselves storage, but now we use a K3s-provided dynamically provisioned storage by specifying storageClassName: local-path. Since the local-path storage is dynamically provisioned, we don't need to create PersistentVolume for the volume, K3s takes care of that for us.

```shell
# two PersistentVolumeClaims are created
$ kubectl get pvc
NAME              STATUS   VOLUME                   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
data-redis-ss-0   Bound    pvc-f318ca82-d584-4e10   100Mi      RWO            local-path     53m
data-redis-ss-1   Bound    pvc-d8e5b81a-05ec-420b   100Mi      RWO            local-path     53m
```

As there is no clusterIP, the service is only accessible from within the cluster

```shell
$ ping redis-svc
PING redis-svc (10.42.2.25): 56 data bytes
64 bytes from 10.42.2.25: seq=0 ttl=64 time=0.165 ms

$ nslookup redis-svc
Name:	redis-svc.default.svc.cluster.local
Address: 10.42.2.25
Name:	redis-svc.default.svc.cluster.local
Address: 10.42.1.32
```

The identities of the pods are permanent, so if e.g. the pod redis-stset-0 dies, it is guaranteed to have the same name when it is scheduled again, and it is still attached to the same volume.

It is possible to combine different resource definitions in a single file by separating them with three - characters, ie.

```shell
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-stset
spec:
  serviceName: redis-svc
  replicas: 2
  selector:
    matchLabels:
      app: redisapp
  # more rows
---
apiVersion: v1
kind: Service
metadata:
  name: redis-svc
  labels:
    app: redis
spec:
  ports:
  - port: 6379
    name: web
  clusterIP: None
  selector:
    app: redisapp
```

[Running Postgres DB on a container](https://hub.docker.com/_/postgres)

#### Job and Cronjobs

An example backup job:

```shell
apiVersion: batch/v1
kind: Job
metadata:
  name: backup
spec:
  template:
    spec:
      containers:
      - name: backup
        image: jakousa/simple-backup-example
        env:
          - name: URL
            value: "postgres://postgres:example@postgres-svc:5432/postgres"
      restartPolicy: Never # This time we'll run it only once
```

```shell
$ kubectl get jobs
  NAME     COMPLETIONS   DURATION   AGE
  backup   1/1           7s         35s

$ kubectl logs backup-wj9r5
  ...
  pg_dump: saving encoding = UTF8
  pg_dump: saving standard_conforming_strings = on
  pg_dump: saving search_path =
  pg_dump: implied data-only restore
  Not sending the dump actually anywhere
```

```shell
# A cronjob needs to be created first
kubectl apply -f ./hourly-todo-post-cronjob.yaml

# Additional one-time jobs can be created from the job template (ie. for testing)
kubectl create job --from=cronjob/to-do-wiki-cronjob test-wiki-job2
```

### [Part 5: Monitoring](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-3/monitoring)

Let's look into how Kubernetes applications are managed more easily with [Helm](https://helm.sh), the package manager for Kubernetes. Helm uses a packaging format called charts to define the dependencies of an application. Among other things, Helm charts include information for the version of the chart, the requirements of the application, such as the Kubernetes version as well as other charts that it may depend on.

After installation configuration

```shell
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
$ helm repo add stable https://charts.helm.sh/stable
$ helm repo update
```

Installation of Prometheus for monitoring

```shell
$ kubectl create namespace prometheus
$ helm install prometheus-community/kube-prometheus-stack --generate-name --namespace prometheus
...
NAME: kube-prometheus-stack-1767251485
LAST DEPLOYED: Thu Jan  1 09:11:31 2026
NAMESPACE: prometheus
STATUS: deployed
REVISION: 1
DESCRIPTION: Install complete
NOTES:
kube-prometheus-stack has been installed. Check its status by running:
  kubectl --namespace prometheus get pods -l "release=kube-prometheus-stack-1767251485"

Get Grafana 'admin' user password by running:

  kubectl --namespace prometheus get secrets kube-prometheus-stack-1767251485-grafana -o jsonpath="{.data.admin-password}" | base64 -d ; echo

Access Grafana local instance:

  export POD_NAME=$(kubectl --namespace prometheus get pod -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=kube-prometheus-stack-1767251485" -oname)
  kubectl --namespace prometheus port-forward $POD_NAME 3000

Get your grafana admin user password by running:

  kubectl get secret --namespace prometheus -l app.kubernetes.io/component=admin-secret -o jsonpath="{.items[0].data.admin-password}" | base64 --decode ; echo


Visit https://github.com/prometheus-operator/kube-prometheus for instructions on how to create & configure Alertmanager and Prometheus instances using the Operator.
```

Removing helm installed packages

```shell
helm list -n prometheus
helm delete [name]
```

Opening a port for Grafana

```shell
$ kubectl get pods -n prometheus
 NAME                                                              READY   STATUS    RESTARTS   AGE
 kube-prometheus-stack-1602180058-prometheus-node-exporter-nt8cp   1/1     Running   0          53s
 kube-prometheus-stack-1602180058-prometheus-node-exporter-ft7dg   1/1     Running   0          53s
 kube-prometheus-stack-1602-operator-557c9c4f5-wbsqc               2/2     Running   0          53s
 kube-prometheus-stack-1602180058-prometheus-node-exporter-tr7ns   1/1     Running   0          53s
 kube-prometheus-stack-1602180058-kube-state-metrics-55dccdkkz6w   1/1     Running   0          53s
 alertmanager-kube-prometheus-stack-1602-alertmanager-0            2/2     Running   0          35s
 kube-prometheus-stack-1602180058-grafana-59cd48d794-4459m         2/2     Running   0          53s
 prometheus-kube-prometheus-stack-1602-prometheus-0                3/3     Running   1          23s

$ kubectl -n prometheus port-forward kube-prometheus-stack-1602180058-grafana-59cd48d794-4459m 3000
  Forwarding from 127.0.0.1:3000 -> 3000
  Forwarding from [::1]:3000 -> 3000
```

Installing Loki

```shell
$ helm repo add grafana https://grafana.github.io/helm-charts
$ helm repo update
$ kubectl create namespace loki-stack
  namespace/loki-stack created

$ helm upgrade --install loki --namespace=loki-stack grafana/loki-stack --set loki.image.tag=2.9.3

$ kubectl get all -n loki-stack
  NAME                      READY   STATUS    RESTARTS   AGE
  pod/loki-promtail-n2fgs   1/1     Running   0          18m
  pod/loki-promtail-h6xq2   1/1     Running   0          18m
  pod/loki-promtail-8l84g   1/1     Running   0          18m
  pod/loki-0                1/1     Running   0          18m

  NAME                    TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
  service/loki            ClusterIP   10.43.170.68   <none>        3100/TCP   18m
  service/loki-headless   ClusterIP   None           <none>        3100/TCP   18m

  NAME                           DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
  daemonset.apps/loki-promtail   3         3         3       3            3           <none>          18m

  NAME                    READY   AGE
  statefulset.apps/loki   1/1     18m
```

Modifying a helm deployment with a new datasource (loki)

```shell
kubectl get configmap -n prometheus | grep grafana\n
kubectl get configmap kube-prometheus-stack-1767-grafana-datasource -n prometheus -o yaml\n
kubectl get all -n prometheus
vi values.yaml
grafana:
  additionalDataSources:
    - name: Loki
      type: loki
      access: proxy
      url: http://loki.loki-stack.svc.cluster.local:3100
      isDefault: false
      jsonData:
        timeout: 60

helm list -A
helm upgrade kube-prometheus-stack-1767251485 prometheus-community/kube-prometheus-stack \\n  -n prometheus \\n  -f values.yaml\n
```

## [Chapter 4 - To the cloud](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-4)

### [Part 1: Introduction to Google Kubernetes Engine](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-4/introduction-to-google-kubernetes-engine)

Installation on MacOS

```shell
brew install --cask google-cloud-sdk
```

Login and choose the project

```shell
$ gcloud -v
  Google Cloud SDK 471.0.0
  bq 2.1.3
  core 2024.03.29
  gcloud-crc32c 1.0.0
  gsutil 5.27

$ gcloud auth login
  ...
  You are now logged in

$ gcloud config set project dwk-gke-idhere
  Updated property [core/project].
```

Create a Kubernetes cluster

```shell
$ gcloud services enable container.googleapis.com
  Operation "operations/acf.p2-385245615727-2f855eed-e785-49ac-91da-896925a691ab" finished successfully.

$ gcloud container clusters create dwk-cluster --zone=europe-north1-b --cluster-version=1.32 --disk-size=32 --num-nodes=3 --machine-type=e2-micro
  ...
  Creating cluster dwk-cluster in europe-north1-b...
  ...
  kubeconfig entry generated for dwk-cluster.
  NAME         LOCATION         MASTER_VERSION   MASTER_IP       MACHINE_TYPE  NODE_VERSION     NUM_NODES  STATUS
  dwk-cluster  europe-north1-b  1.29.8-gke.2200  35.228.176.118  e2-medium     1.29.8-gke.2200  3          RUNNING
```

An alternative better suited for the course requirements

```shell
gcloud container clusters create gc-kubehelvetti-2 \
  --zone=europe-north1-b \
  --cluster-version=latest \
  --machine-type=e2-medium \
  --num-nodes=1 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=3 \
  --disk-size=32
```

If the command does not work, you need to install gke-gcloud-auth-plugin by following [this](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl#install_plugin).

Checking cluster-info

```shell
$ kubectl cluster-info
Kubernetes control plane is running at https://35.238.53.231
GLBCDefaultBackend is running at https://35.238.53.231/api/v1/namespaces/kube-system/services/default-http-backend:http/proxy
KubeDNS is running at https://35.238.53.231/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
Metrics-server is running at https://35.238.53.231/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy
```

If the cluster is still pointing to local cluster

```shell
$ gcloud container clusters get-credentials dwk-cluster --zone=europe-north1-b
  Fetching cluster endpoint and auth data.
  kubeconfig entry generated for dwk-cluster.
```

#### Gateway API

The [Gateway API](https://gateway-api.sigs.k8s.io/) is a set of resources and standards that allow you to define how external traffic should be routed to services within your Kubernetes cluster. It builds on the ingress concept but offers more advanced features, making it easier to handle complex routing and traffic management scenarios.

```shell
$ gcloud container clusters update clustername --location=europe-north1-b --gateway-api=standard
```

Defining gateway.yaml file

```shell
apiVersion: gateway.networking.k8s.io/v1beta1
kind: Gateway
metadata:
  name: my-gateway
spec:
  gatewayClassName: gke-l7-global-external-managed
  listeners:
  - name: http
    protocol: HTTP
    port: 80
    allowedRoutes:
      kinds:
      - kind: HTTPRoute
```

We also need to define route.yaml

```shell
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: my-route
spec:
  parentRefs:
  - name: my-gateway
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: seedimage-svc
      port: 80
```

Service needs to be configured back into ClusterIP

```shell
apiVersion: v1
kind: Service
metadata:
  name: seedimage-svc
spec:
  type: ClusterIP
  selector:
    app: seedimage
  ports:
    - port: 80
      protocol: TCP
      targetPort: 3000
```

Gateway object tells us the IP address of the cluster

```shell
$ kubectl get gateway my-gateway
NAME         CLASS         ADDRESS          PROGRAMMED   AGE
my-gateway   gke-l7-gxlb   35.227.224.141   True         106m

# another helpful command
kubectl describe gateway my-gateway
```

[HTTP path redirects and rewrites](https://gateway-api.sigs.k8s.io/guides/http-redirect-rewrite/) are used so that we do not need to de

### [Part 2: Deployment Pipeline](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-4/deployment-pipeline)

[Kustomize](https://github.com/kubernetes-sigs/kustomize) is a tool that helps with configuration customization and is baked into kubectl. In this case we'll use it to define which files are meaningful for Kubernetes.

Follow the common practice and add the configuration file kustomization.yaml, in the root of the project. The kustomization.yaml should include instructions on how to use the deployment.yaml and service.yaml:

```shell
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - manifests/deployment.yaml
  - manifests/service.yaml

# Apply
$ kubectl apply -k .

# ... Or do a dry run
$ kubectl kustomize .
```

[Kustomize cheat sheet](https://itnext.io/kubernetes-kustomize-cheat-sheet-8e2d31b74d8f)

#### GitHub Actions

Our GitHub Actions workflow will push Docker images to Google Artifact Registry.

Now we are ready to define the workflow in the file .github/workflows/main.yaml. We'll want the workflow to do 3 things:

- build the image
- publish the image to a container registry
- deploy the new image to our cluster

The config will look something like this:

```shell
name: Release application

on:
  push:

env:
  PROJECT_ID: ${{ secrets.GKE_PROJECT }}
  GKE_CLUSTER: dwk-cluster
  GKE_ZONE: europe-north1-b
  REGISTRY: europe-north1-docker.pkg.dev
  REPOSITORY: my-repository
  IMAGE: dwk-environments
  SERVICE: dwk-environments
  BRANCH: ${{ github.ref_name }}

# ...
jobs:
  build-publish-deploy:
    name: Build, Publish and Deploy
    runs-on: ubuntu-latest

    steps:
      - name: 'Checkout'
        uses: actions/checkout@v4

      - uses: google-github-actions/auth@v2
        with:
          credentials_json: '${{ secrets.GKE_SA_KEY }}'

      - name: 'Set up Cloud SDK'
        uses: google-github-actions/setup-gcloud@v2

      - name: 'Use gcloud CLI'
        run: gcloud info

      - name: 'Configure Docker'
        run: gcloud --quiet auth configure-docker

      - name: 'Get GKE credentials'
        uses: 'google-github-actions/get-gke-credentials@v2'
        with:
          cluster_name: '${{ env.GKE_CLUSTER }}'
          project_id: '${{ env.PROJECT_ID }}'
          location: '${{ env.GKE_ZONE }}'

      - name : 'Form the image name'
        run: echo "IMAGE_TAG=$REGISTRY/$PROJECT_ID/$REPOSITORY/$IMAGE:$BRANCH-$GITHUB_SHA" >> $GITHUB_ENV

      - name: Build
        run: docker build --tag $IMAGE_TAG .

      - name: Publish
        run: docker push $IMAGE_TAG

      - name: Set up Kustomize
        uses: imranismail/setup-kustomize@v2.1.0

      - name: Deploy
        run: |-
          kubectl create namespace ${GITHUB_REF#refs/heads/} || true
          kubectl config set-context --current --namespace=${GITHUB_REF#refs/heads/}
          kustomize edit set namespace ${GITHUB_REF#refs/heads/}
          kustomize edit set image PROJECT/IMAGE=$IMAGE_TAG
          kustomize build . | kubectl apply -f -
          kubectl rollout status deployment $SERVICE
          kubectl get services -o wide

```

The secrets used in authentication are not from the environment variables but are included as environment secrets in the project GitHub.

The secret GKE_PROJECT is the Google Cloud project ID, that you find in the Google Cloud console.

The secret GKE_SA_KEY is a service account key that is required to access the Google Cloud services. You will need to create a new service account and fetch its key. Creation happens in the IAM&Admin / Service account section in the Google Cloud Console.

Give these IAM roles to your service account:

- Kubernetes Engine Service Agent - Gives Kubernetes Engine account access to manage cluster resources. Includes access to service accounts.
- Storage Admin - Grants full control of buckets and objects.
- Artifact Registry Administrator - Administrator access to create and manage repositories.
- Artifact Registry Create-on-Push Repository Administrator - Access to manage artifacts in repositories, as well as create new repositories on push.

_Giving IAM roles is also done using the Console by selectiong IAM&Admin/IAM._

After creating the service account, create the authentication key:

```shell
$ gcloud iam service-accounts keys create ./private-key.json --iam-account=github-actions@dwk-gke-331210.iam.gserviceaccount.com
```

### [Part 3: GKE Features]

#### Backing up the database in GKE

Create a bucket

```shell
gsutil mb gs://todo-postgres-backups
```

Create a service account (Cluster)

```shell
apiVersion: v1
kind: ServiceAccount
metadata:
  name: pg-backup-sa
  namespace: project
  annotations:
    iam.gke.io/gcp-service-account: pg-backup@PROJECT_ID.iam.gserviceaccount.com

```

Create the service account in gcloud and give it the required privileges

```shell
gcloud iam service-accounts create pg-backup

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:pg-backup@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"


gcloud iam service-accounts add-iam-policy-binding \
  pg-backup@PROJECT_ID.iam.gserviceaccount.com \
  --member="serviceAccount:PROJECT_ID.svc.id.goog[project/pg-backup-sa]" \
  --role="roles/iam.workloadIdentityUser"

```

Note! If you've created the cluster without workload identity, you will have to do a lot more shit, ie. recreate the node pool with the option enabled etc... Consult an LLM or similar for that.
