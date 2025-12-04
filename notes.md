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
