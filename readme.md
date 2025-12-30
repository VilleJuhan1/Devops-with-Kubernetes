# Devops with Kubernetes

This repository contains my submissions to [MOOC Devops with Kubernetes](https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes).

## k3d environment

Building the local k3d environment that works with the latest release (ping-pong-pv is no longer necessary):

```shell
k3d cluster create kubehelvetti \
  --port 8082:31111@agent:0 \
  -p 8081:80@loadbalancer \
  --agents 2 \
  --volume "/tmp/kubedata/ping-pong-log-output-pv:/tmp/kubedata/ping-pong-log-output-pv@agent:*" \
  --volume "/tmp/kubedata/to-do-assets-pv:/tmp/kubedata/to-do-assets-pv@agent:*"
```

## Submissions

The link to the present release might be absent from the release itself but is present in the latest commit.

### Part 1

- [v0.1.1 Log output](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.1)
- [v0.1.2 The project, step 1](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.2)
- [v0.1.3 Declarative approach](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.3)
- [v0.1.4 The project, step 2](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.4)
- [v0.1.5 The project, step 3](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.5)
- [v0.1.6 The project, step 4](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.6)
- [v0.1.7 External access with Ingress](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.7)
- [v0.1.8 The project, step 5](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.8)
- [v0.1.9 More services](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.9)
- [v0.1.10 Even more services](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.10)
- [v0.1.11 Persisting data](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.11)
- [v0.1.12 The project, step 6](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.12)
- [v0.1.13 The project, step 7](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/1.13)

### Part 2

- [v0.2.1 Connecting pods](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/2.1)
- [v0.2.2 The project, step 8](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/2.2)
- [v0.2.3 Keep them separated](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/2.3)
- [v0.2.4 The project, step 9](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/2.4)
- [v0.2.5. Documentation and ConfigMaps](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/2.5)
- [v0.2.6. The project, step 10](https://github.com/VilleJuhan1/Devops-with-Kubernetes/tree/2.6)
