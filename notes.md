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

### [Part 3: Introduction to Networking](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes/chapter-2/introduction-to-networking)
