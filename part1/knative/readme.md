# Hello World in knative

```shell
k3d cluster create serverless --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 1 --k3s-arg "--disable=traefik@server:0"
kubectx serverless
kubectl get nodes
kubectl apply -f https://github.com/knative/serving/releases/latest/download/serving-crds.yaml
kubectl wait --for=condition=Established crd --all
kubectl apply -f https://github.com/knative/serving/releases/latest/download/serving-core.yaml
kubectl get pods -n knative-serving
kubectl apply -f https://github.com/knative/net-kourier/releases/latest/download/kourier.yaml
kubectl patch configmap/config-network \\n -n knative-serving \\n --type merge \\n -p '{"data":{"ingress-class":"kourier.ingress.networking.knative.dev"}}'
kubectl get pods -n kourier-system
kubectl get svc -n kourier-system
kubectl edit configmap/config-domain -n knative-serving

# Add the following, replace with your internal lb address
data:
  <lbip-adress>.sslip.io: ""

kubectl apply -f ./hello.yaml
kubectl get ksvc

# Use the internal IP from hello ksvc
curl -H "Host: hello.default.192.168.32.3.sslip.io" http://127.0.0.1:8081

# Observe autoscaling (pods will terminate quite soon)
kubectl get pods

# Change the environment value in hello.yaml to something else and apply
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: hello
spec:
  template:
    spec:
      containers:
        - image: ghcr.io/knative/helloworld-go:latest
          ports:
            - containerPort: 8080
          env:
            - name: TARGET
              value: "Knative"

kubectl apply -f hello.yaml

# Spam the service
curl -H "Host: hello.default.192.168.32.3.sslip.io" http://127.0.0.1:8081

# Observe the revisions and traffic splitting
kubectl get revisions
```
